const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');

// Columnas públicas del usuario (excluye password_hash)
const CAMPOS_PUBLICOS = 'id, nombre, documento, email, username, rol, activo, external_perfil_id, created_at, updated_at';

const login = async (username, password) => {
  const resultado = await pool.query(
    'SELECT * FROM usuarios WHERE username = $1 AND activo = true',
    [username]
  );

  const usuario = resultado.rows[0];

  if (!usuario) {
    const error = new Error('Usuario incorrecto');
    error.status = 401;
    throw error;
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);

  if (!coincide) {
    const error = new Error('Contraseña incorrecta');
    error.status = 401;
    throw error;
  }

  const carga = {
    id: usuario.id,
    username: usuario.username,
    rol: usuario.rol,
    nombre: usuario.nombre,
  };

  const token = jwt.sign(carga, process.env.JWT_SECRET, { expiresIn: '8h' });

  return {
    token,
    user: { id: usuario.id, username: usuario.username, rol: usuario.rol, nombre: usuario.nombre },
  };
};

const obtenerUsuarioActual = async (userId) => {
  const resultado = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`,
    [userId]
  );

  if (!resultado.rows[0]) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  return resultado.rows[0];
};

module.exports = { login, obtenerUsuarioActual };
