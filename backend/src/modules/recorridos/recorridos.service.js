const pool = require('../../config/database');
const { crearRecorridoExterno, registrarPosicionExterna } = require('../../services/externalApiService');

const iniciarRecorrido = async (conductorId) => {
  // 1. Busca las asignaciones del conductor para hoy con estado 'pendiente'
  const asignacionQuery = await pool.query(
    `SELECT * FROM asignaciones 
     WHERE conductor_id = $1 
       AND fecha = CURRENT_DATE 
       AND estado = 'pendiente' 
     ORDER BY created_at ASC 
     LIMIT 1`,
    [conductorId]
  );
  
  if (asignacionQuery.rows.length === 0) {
    const error = new Error('No tienes asignaciones pendientes para hoy');
    error.status = 400;
    throw error;
  }
  const asignacion = asignacionQuery.rows[0];

  // 2. Busca el primer vehículo con estado 'operativo' disponible (que no tenga un recorrido en curso)
  const vehiculoQuery = await pool.query(
    `SELECT v.* FROM vehiculos v
     LEFT JOIN recorridos r ON v.id = r.vehiculo_id AND r.estado = 'en_curso'
     WHERE v.estado = 'operativo' AND r.id IS NULL
     LIMIT 1`
  );

  if (vehiculoQuery.rows.length === 0) {
    const error = new Error('No hay vehículos disponibles en este momento');
    error.status = 400;
    throw error;
  }
  const vehiculo = vehiculoQuery.rows[0];

  // 3. Crea el registro del recorrido
  const insertRecorrido = await pool.query(
    `INSERT INTO recorridos (asignacion_id, vehiculo_id, timestamp_inicio, estado)
     VALUES ($1, $2, NOW(), 'en_curso')
     RETURNING *`,
    [asignacion.id, vehiculo.id]
  );
  const recorrido = insertRecorrido.rows[0];

  // 4. Actualiza el estado de la asignación a 'en_curso'
  await pool.query(
    `UPDATE asignaciones SET estado = 'en_curso', updated_at = NOW() WHERE id = $1`,
    [asignacion.id]
  );

  // 5. Intenta sincronizar con la API externa (si falla, no bloquea el flujo principal)
  try {
    const usuarioQuery = await pool.query('SELECT external_perfil_id FROM usuarios WHERE id = $1', [conductorId]);
    const perfilIdExterno = usuarioQuery.rows[0]?.external_perfil_id;
    
    if (perfilIdExterno) {
      const idExterno = await crearRecorridoExterno({
        ruta_id: asignacion.ruta_id, // Asumiendo que ruta_id local está mapeado igual o manejan uuid
        vehiculo_id: vehiculo.external_id || vehiculo.id,
        perfil_id: perfilIdExterno
      });

      if (idExterno) {
        await pool.query(
          `UPDATE recorridos SET external_id = $1 WHERE id = $2`,
          [idExterno, recorrido.id]
        );
        recorrido.external_id = idExterno;
      }
    }
  } catch (err) {
    console.error('Error al sincronizar recorrido con API externa:', err.message);
  }

  // 6. Retorna con joins básicos
  const resultado = await pool.query(
    `SELECT r.*, a.ruta_id, v.placa AS vehiculo_placa, v.marca AS vehiculo_marca 
     FROM recorridos r
     JOIN asignaciones a ON r.asignacion_id = a.id
     JOIN vehiculos v ON r.vehiculo_id = v.id
     WHERE r.id = $1`,
    [recorrido.id]
  );

  return resultado.rows[0];
};

const finalizarRecorrido = async (recorridoId, conductorId) => {
  // Verificar propiedad
  const verifyQuery = await pool.query(
    `SELECT r.*, a.conductor_id 
     FROM recorridos r
     JOIN asignaciones a ON r.asignacion_id = a.id
     WHERE r.id = $1 AND a.conductor_id = $2`,
    [recorridoId, conductorId]
  );
  
  if (verifyQuery.rows.length === 0) {
    const error = new Error('Recorrido no encontrado o no autorizado');
    error.status = 404;
    throw error;
  }
  const recorrido = verifyQuery.rows[0];

  // Actualizar recorrido
  const updateRecorrido = await pool.query(
    `UPDATE recorridos 
     SET timestamp_fin = NOW(), estado = 'completado', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [recorridoId]
  );

  // Actualizar la asignación a completada
  await pool.query(
    `UPDATE asignaciones SET estado = 'completada', updated_at = NOW() WHERE id = $1`,
    [recorrido.asignacion_id]
  );

  return updateRecorrido.rows[0];
};

const obtenerRecorridoActivo = async (conductorId) => {
  const rs = await pool.query(
    `SELECT r.*, a.ruta_id, a.conductor_id, v.placa, v.marca
     FROM recorridos r
     JOIN asignaciones a ON r.asignacion_id = a.id
     JOIN vehiculos v ON r.vehiculo_id = v.id
     WHERE a.conductor_id = $1 AND r.estado = 'en_curso'
     LIMIT 1`,
    [conductorId]
  );
  return rs.rows[0] || null;
};

const registrarPosicion = async (recorridoId, lat, lon, conductorId) => {
  // Verificar propiedad y estado
  const verifyQuery = await pool.query(
    `SELECT r.*, a.conductor_id, u.external_perfil_id 
     FROM recorridos r
     JOIN asignaciones a ON r.asignacion_id = a.id
     JOIN usuarios u ON a.conductor_id = u.id
     WHERE r.id = $1 AND a.conductor_id = $2 AND r.estado = 'en_curso'`,
    [recorridoId, conductorId]
  );
  
  if (verifyQuery.rows.length === 0) {
    const error = new Error('Recorrido no encontrado, no autorizado o ya finalizado');
    error.status = 404;
    throw error;
  }
  const recorrido = verifyQuery.rows[0];

  // Insertar en tabla posiciones
  const insertPos = await pool.query(
    `INSERT INTO posiciones (recorrido_id, lat, lon, timestamp_captura, sincronizado_backend, sincronizado_api_ext)
     VALUES ($1, $2, $3, NOW(), true, false)
     RETURNING *`,
    [recorridoId, lat, lon]
  );
  const posicion = insertPos.rows[0];

  // Intentar sincronizar con la API externa si existe connection
  if (recorrido.external_id && recorrido.external_perfil_id) {
    const exito = await registrarPosicionExterna({
      recorridoExternalId: recorrido.external_id,
      lat,
      lon,
      perfilId: recorrido.external_perfil_id
    });

    if (exito) {
      await pool.query(
        `UPDATE posiciones SET sincronizado_api_ext = true WHERE id = $1`,
        [posicion.id]
      );
      posicion.sincronizado_api_ext = true;
    }
  }

  return posicion;
};

const suspenderRecorridosVencidos = async () => {
  try {
    // Actualizar recorridos a suspendidos si pasan de 24h
    const resRecorridos = await pool.query(
      `UPDATE recorridos 
       SET estado = 'suspendido', suspendido_auto = true, timestamp_fin = NOW(), updated_at = NOW()
       WHERE estado = 'en_curso' AND timestamp_inicio < NOW() - INTERVAL '24 hours'
       RETURNING asignacion_id`
    );

    const cantidad = resRecorridos.rowCount;
    if (cantidad === 0) return;

    // Obtener array de ids de las asignaciones para cancelarlas en bloque
    const asignacionIds = resRecorridos.rows.map(r => r.asignacion_id);

    if (asignacionIds.length > 0) {
      await pool.query(
        `UPDATE asignaciones SET estado = 'cancelada', updated_at = NOW() WHERE id = ANY($1)`,
        [asignacionIds]
      );
    }

    console.log(`[Job Cron] ${cantidad} recorridos vencidos (más de 24 hrs) fueron suspendidos automáticamente.`);
  } catch (err) {
    console.error('Error al suspender recorridos vencidos:', err.message);
  }
};

module.exports = {
  iniciarRecorrido,
  finalizarRecorrido,
  obtenerRecorridoActivo,
  registrarPosicion,
  suspenderRecorridosVencidos
};
