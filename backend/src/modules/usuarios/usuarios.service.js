const bcrypt = require('bcrypt');
const pool = require('../../config/database');

// Columnas a seleccionar (excluye password_hash)
const CAMPOS_PUBLICOS = 'id, nombre, documento, email, username, rol, activo, external_perfil_id, created_at, updated_at';

const obtenerTodos = async () => {
  const resultado = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY created_at DESC`
  );
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`,
    [id]
  );
  if (!resultado.rows[0]) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }
  return resultado.rows[0];
};

const crear = async ({ nombre, documento, email, username, password, rol }) => {
  const hashContrasena = await bcrypt.hash(password, 10);

  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, documento, email, username, password_hash, rol)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, documento, email, username, hashContrasena, rol]
  );
  return resultado.rows[0];
};

const actualizar = async (id, { nombre, documento, email, username }) => {
  await obtenerPorId(id); // lanza 404 si no existe

  const resultado = await pool.query(
    `UPDATE usuarios
     SET nombre     = COALESCE($1, nombre),
         documento  = COALESCE($2, documento),
         email      = COALESCE($3, email),
         username   = COALESCE($4, username),
         updated_at = NOW()
     WHERE id = $5
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, documento, email, username, id]
  );
  return resultado.rows[0];
};

const desactivar = async (id) => {
  await obtenerPorId(id); // lanza 404 si no existe

  const resultado = await pool.query(
    `UPDATE usuarios SET activo = false, updated_at = NOW()
     WHERE id = $1
     RETURNING ${CAMPOS_PUBLICOS}`,
    [id]
  );
  return resultado.rows[0];
};

const activar = async (id) => {
  await obtenerPorId(id); // lanza 404 si no existe

  const resultado = await pool.query(
    `UPDATE usuarios SET activo = true, updated_at = NOW()
     WHERE id = $1
     RETURNING ${CAMPOS_PUBLICOS}`,
    [id]
  );
  return resultado.rows[0];
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, desactivar, activar };
