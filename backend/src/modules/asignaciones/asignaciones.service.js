const pool = require('../../config/database');

const ESTADOS_VALIDOS = ['pendiente', 'en_curso', 'completada', 'cancelada'];

// SQL reutilizable para los JOINs
const QUERY_BASE = `
  SELECT a.id, a.conductor_id, a.ruta_id, a.fecha, a.estado, a.created_at, a.updated_at,
         u.nombre AS conductor_nombre,
         r.nombre AS ruta_nombre
  FROM asignaciones a
  JOIN usuarios u ON a.conductor_id = u.id
  JOIN rutas    r ON a.ruta_id     = r.id
`;

const obtenerTodas = async () => {
  const resultado = await pool.query(`${QUERY_BASE} ORDER BY a.fecha DESC`);
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await pool.query(
    `${QUERY_BASE} WHERE a.id = $1`,
    [id]
  );
  if (!resultado.rows[0]) {
    const error = new Error('Asignación no encontrada');
    error.status = 404;
    throw error;
  }
  return resultado.rows[0];
};

const obtenerPorConductor = async (conductorId) => {
  const resultado = await pool.query(
    `${QUERY_BASE}
     WHERE a.conductor_id = $1
       AND a.fecha = CURRENT_DATE
     ORDER BY a.created_at DESC`,
    [conductorId]
  );
  return resultado.rows;
};

const crear = async ({ conductor_id, ruta_id, fecha }) => {
  // Validar que el conductor exista y tenga rol 'conductor'
  const resConductor = await pool.query(
    `SELECT id FROM usuarios WHERE id = $1 AND rol = 'conductor' AND activo = true`,
    [conductor_id]
  );
  if (!resConductor.rows[0]) {
    const error = new Error('El conductor no existe o no tiene el rol conductor');
    error.status = 400;
    throw error;
  }

  // Validar que la ruta exista y esté activa
  const resRuta = await pool.query(
    `SELECT id FROM rutas WHERE id = $1 AND activa = true`,
    [ruta_id]
  );
  if (!resRuta.rows[0]) {
    const error = new Error('La ruta no existe o no está activa');
    error.status = 400;
    throw error;
  }

  // Verificar duplicado (conductor + ruta + fecha)
  const resDuplicado = await pool.query(
    `SELECT id FROM asignaciones WHERE conductor_id = $1 AND ruta_id = $2 AND fecha = $3`,
    [conductor_id, ruta_id, fecha]
  );
  if (resDuplicado.rows[0]) {
    const error = new Error('Ya existe una asignación para ese conductor en esa ruta ese día');
    error.status = 400;
    throw error;
  }

  // Insertar la asignación
  const resultado = await pool.query(
    `INSERT INTO asignaciones (conductor_id, ruta_id, fecha)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [conductor_id, ruta_id, fecha]
  );

  return obtenerPorId(resultado.rows[0].id);
};

const cambiarEstado = async (id, estado) => {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    const error = new Error(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
    error.status = 400;
    throw error;
  }

  await obtenerPorId(id); // lanza 404 si no existe

  if (estado === 'cancelada') {
    await pool.query(
      `UPDATE recorridos
       SET estado = 'suspendido', timestamp_fin = NOW(), updated_at = NOW()
       WHERE asignacion_id = $1 AND estado = 'en_curso'`,
      [id]
    );
  }

  const resultado = await pool.query(
    `UPDATE asignaciones SET estado = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [estado, id]
  );

  return obtenerPorId(resultado.rows[0].id);
};

module.exports = { obtenerTodas, obtenerPorId, obtenerPorConductor, crear, cambiarEstado };
