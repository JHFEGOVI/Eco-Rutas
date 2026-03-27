const pool = require('../../config/database');
const { crearRutaExterna } = require('../../services/externalApiService');

const obtenerTodas = async () => {
  const resultado = await pool.query(
    `SELECT id, nombre, descripcion,
            ST_AsGeoJSON(geometria) AS geometria,
            activa, external_id, created_at, updated_at
     FROM rutas
     WHERE activa = true
     ORDER BY created_at DESC`
  );
  // Parsear el string GeoJSON a objeto
  return resultado.rows.map((ruta) => ({
    ...ruta,
    geometria: JSON.parse(ruta.geometria),
  }));
};

const obtenerPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT id, nombre, descripcion,
            ST_AsGeoJSON(geometria) AS geometria,
            activa, external_id, created_at, updated_at
     FROM rutas
     WHERE id = $1`,
    [id]
  );
  if (!resultado.rows[0]) {
    const error = new Error('Ruta no encontrada');
    error.status = 404;
    throw error;
  }
  return {
    ...resultado.rows[0],
    geometria: JSON.parse(resultado.rows[0].geometria),
  };
};

const crear = async ({ nombre, descripcion, geometria }) => {
  // Insertar ruta con geometría en formato PostGIS
  const resultado = await pool.query(
    `INSERT INTO rutas (nombre, descripcion, geometria)
     VALUES ($1, $2, ST_GeomFromGeoJSON($3))
     RETURNING id, nombre, descripcion,
               ST_AsGeoJSON(geometria) AS geometria,
               activa, external_id, created_at, updated_at`,
    [nombre, descripcion, JSON.stringify(geometria)]
  );
  const ruta = {
    ...resultado.rows[0],
    geometria: JSON.parse(resultado.rows[0].geometria),
  };

  // Intentar registrar en la API externa (no bloquea el flujo)
  const idExterno = await crearRutaExterna({
    nombre_ruta: ruta.nombre,
    perfil_id: null,
    shape: ruta.geometria,
  });

  // Guardar el external_id si la API externa respondió
  if (idExterno) {
    await pool.query(
      'UPDATE rutas SET external_id = $1 WHERE id = $2',
      [idExterno, ruta.id]
    );
    ruta.external_id = idExterno;
  }

  return ruta;
};

const actualizar = async (id, { nombre, descripcion, geometria }) => {
  await obtenerPorId(id); // lanza 404 si no existe

  // Construir la query dinámicamente según si llega geometría o no
  let resultado;
  if (geometria) {
    resultado = await pool.query(
      `UPDATE rutas
       SET nombre      = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           geometria   = ST_GeomFromGeoJSON($3),
           updated_at  = NOW()
       WHERE id = $4
       RETURNING id, nombre, descripcion,
                 ST_AsGeoJSON(geometria) AS geometria,
                 activa, external_id, created_at, updated_at`,
      [nombre, descripcion, JSON.stringify(geometria), id]
    );
  } else {
    resultado = await pool.query(
      `UPDATE rutas
       SET nombre      = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           updated_at  = NOW()
       WHERE id = $3
       RETURNING id, nombre, descripcion,
                 ST_AsGeoJSON(geometria) AS geometria,
                 activa, external_id, created_at, updated_at`,
      [nombre, descripcion, id]
    );
  }

  return {
    ...resultado.rows[0],
    geometria: JSON.parse(resultado.rows[0].geometria),
  };
};

const desactivar = async (id) => {
  await obtenerPorId(id); // lanza 404 si no existe

  const resultado = await pool.query(
    `UPDATE rutas SET activa = false, updated_at = NOW()
     WHERE id = $1
     RETURNING id, nombre, descripcion,
               ST_AsGeoJSON(geometria) AS geometria,
               activa, external_id, created_at, updated_at`,
    [id]
  );
  return {
    ...resultado.rows[0],
    geometria: JSON.parse(resultado.rows[0].geometria),
  };
};

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, desactivar };
