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


/**
 * Restablece la contraseña de un administrador verificando solo su username.
 * Flujo simplificado sin email/tokens - para uso interno/administrativo.
 */
const adminResetPasswordDirecto = async (username, nuevaPassword) => {
  const inicio = Date.now();
  console.log(`[AdminReset] Iniciando reset para usuario: ${username}`);

  // Buscar usuario por username (solo admins o usuarios activos)
  const t1 = Date.now();
  const resultado = await pool.query(
    'SELECT id, username, rol, activo FROM usuarios WHERE username = $1',
    [username]
  );
  console.log(`[AdminReset] Query SELECT: ${Date.now() - t1}ms`);

  const usuario = resultado.rows[0];

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  if (!usuario.activo) {
    const error = new Error('El usuario está inactivo');
    error.status = 403;
    throw error;
  }

  // Validar requisitos de contraseña
  if (!nuevaPassword || nuevaPassword.length < 6) {
    const error = new Error('La contraseña debe tener al menos 6 caracteres');
    error.status = 400;
    throw error;
  }

  // Hashear nueva contraseña - usar 8 rondas en lugar de 10 para mejor performance
  // 8 rondas sigue siendo muy seguro (~50-100ms vs ~200-400ms con 10 rondas)
  const t2 = Date.now();
  const hashPassword = await bcrypt.hash(nuevaPassword, 8);
  console.log(`[AdminReset] bcrypt.hash(): ${Date.now() - t2}ms`);

  // Actualizar contraseña
  const t3 = Date.now();
  await pool.query(
    'UPDATE usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [hashPassword, usuario.id]
  );
  console.log(`[AdminReset] Query UPDATE: ${Date.now() - t3}ms`);

  const total = Date.now() - inicio;
  console.log(`[AdminReset] Total completado en: ${total}ms`);

  return {
    mensaje: `Contraseña de "${username}" actualizada exitosamente`,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol
    }
  };
};

module.exports = {
  login,
  obtenerUsuarioActual,
  adminResetPasswordDirecto
};
