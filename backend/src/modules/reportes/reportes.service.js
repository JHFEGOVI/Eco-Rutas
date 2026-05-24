const pool = require('../../config/database');

/**
 * Inserta un reporte de foto en la base de datos local.
 * @param {{ recorrido_id, posicion_id, foto_base64, external_posicion_id }} datos
 * @returns {object} Fila insertada
 */
const guardarFoto = async ({ recorrido_id, posicion_id, foto_base64, external_posicion_id = null }) => {
  const resultado = await pool.query(
    `INSERT INTO reportes_foto (recorrido_id, posicion_id, foto_base64, external_posicion_id, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [recorrido_id, posicion_id, foto_base64, external_posicion_id]
  );
  return resultado.rows[0];
};

/**
 * Obtiene todas las fotos de un recorrido específico,
 * incluyendo nombre del conductor y nombre de la ruta.
 * @param {string} recorrido_id UUID del recorrido
 * @returns {object[]} Lista de reportes de foto
 */
const obtenerFotosPorRecorrido = async (recorrido_id) => {
  const resultado = await pool.query(
    `SELECT
       rf.id,
       rf.recorrido_id,
       rf.posicion_id,
       rf.foto_base64,
       rf.external_posicion_id,
       rf.created_at,
       u.nombre   AS conductor_nombre,
       ru.nombre  AS ruta_nombre
     FROM reportes_foto rf
     JOIN recorridos r   ON rf.recorrido_id = r.id
     JOIN asignaciones a ON r.asignacion_id = a.id
     JOIN usuarios u     ON a.conductor_id  = u.id
     JOIN rutas ru       ON a.ruta_id       = ru.id
     WHERE rf.recorrido_id = $1
     ORDER BY rf.created_at ASC`,
    [recorrido_id]
  );
  return resultado.rows;
};

/**
 * Obtiene todas las fotos registradas en el sistema,
 * con nombre del conductor, nombre de la ruta y timestamp.
 * @returns {object[]} Lista completa de reportes de foto
 */
const obtenerTodasLasFotos = async () => {
  const resultado = await pool.query(
    `SELECT
       rf.id,
       rf.recorrido_id,
       rf.posicion_id,
       rf.foto_base64,
       rf.external_posicion_id,
       rf.created_at,
       u.nombre   AS conductor_nombre,
       ru.nombre  AS ruta_nombre
     FROM reportes_foto rf
     JOIN recorridos r   ON rf.recorrido_id = r.id
     JOIN asignaciones a ON r.asignacion_id = a.id
     JOIN usuarios u     ON a.conductor_id  = u.id
     JOIN rutas ru       ON a.ruta_id       = ru.id
     ORDER BY rf.created_at DESC`
  );
  return resultado.rows;
};

module.exports = { guardarFoto, obtenerFotosPorRecorrido, obtenerTodasLasFotos };
