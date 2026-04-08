const pool = require('../../config/database');
const { crearVehiculoExterno } = require('../../services/externalApiService');

const obtenerTodos = async () => {
  const resultado = await pool.query(
    'SELECT * FROM vehiculos ORDER BY created_at DESC'
  );
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await pool.query(
    'SELECT * FROM vehiculos WHERE id = $1',
    [id]
  );
  if (!resultado.rows[0]) {
    const error = new Error('Vehículo no encontrado');
    error.status = 404;
    throw error;
  }
  return resultado.rows[0];
};

const crear = async ({ placa, marca, modelo, capacidad_kg, estado, perfil_id_externo }) => {
  if (placa) {
    placa = placa.toUpperCase();
    if (!/^[A-Z]{3}-[0-9]{3}$/.test(placa)) {
      const error = new Error('Formato de placa inválido. Use el formato AAA-111');
      error.status = 400;
      throw error;
    }
  }

  // Insertar en tabla local
  const resultado = await pool.query(
    `INSERT INTO vehiculos (placa, marca, modelo, capacidad_kg, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [placa, marca, modelo, capacidad_kg, estado || 'operativo']
  );
  const vehiculo = resultado.rows[0];

  // Intentar registrar en la API externa (no bloquea el flujo)
  const idExterno = await crearVehiculoExterno({
    placa: vehiculo.placa,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    activo: true,
    perfil_id: perfil_id_externo || null,
  });

  // Si la API externa devolvió un UUID, guardarlo localmente
  if (idExterno) {
    await pool.query(
      'UPDATE vehiculos SET external_id = $1 WHERE id = $2',
      [idExterno, vehiculo.id]
    );
    vehiculo.external_id = idExterno;
  }

  return vehiculo;
};

const actualizar = async (id, { placa, marca, modelo, capacidad_kg, estado }) => {
  await obtenerPorId(id); // lanza 404 si no existe

  const resultado = await pool.query(
    `UPDATE vehiculos
     SET placa = COALESCE($1, placa),
         marca = COALESCE($2, marca),
         modelo = COALESCE($3, modelo),
         capacidad_kg = COALESCE($4, capacidad_kg),
         estado = COALESCE($5, estado),
         updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [placa, marca, modelo, capacidad_kg, estado, id]
  );
  return resultado.rows[0];
};

const desactivar = async (id) => {
  await obtenerPorId(id); // lanza 404 si no existe

  const resultado = await pool.query(
    `UPDATE vehiculos SET estado = 'inactivo', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return resultado.rows[0];
};

const activar = async (id) => {
  await obtenerPorId(id); // lanza 404 si no existe

  const resultado = await pool.query(
    `UPDATE vehiculos SET estado = 'operativo', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return resultado.rows[0];
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, desactivar, activar };
