const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
 * Genera un token criptográficamente seguro para restablecimiento de contraseña
 */
const generarTokenReset = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Simula el envío de email con el token de restablecimiento.
 * En producción, esto debería enviar un email real usando nodemailer o similar.
 */
const enviarEmailReset = async (email, token, nombre) => {
  // URL de restablecimiento (cambiar según el dominio en producción)
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${token}`;

  // Por ahora solo logueamos en consola (simulación)
  // TODO: Integrar con servicio de email real (SendGrid, AWS SES, etc.)
  console.log('========================================');
  console.log('📧 EMAIL DE RESTABLECIMIENTO ENVIADO');
  console.log('========================================');
  console.log(`Para: ${email}`);
  console.log(`Nombre: ${nombre}`);
  console.log(`Token: ${token}`);
  console.log(`URL: ${resetUrl}`);
  console.log('========================================');

  // Retornar éxito simulado
  return true;
};

/**
 * Solicita el restablecimiento de contraseña.
 * Genera un token y envía email (o lo loguea en desarrollo).
 */
const solicitarResetPassword = async (email) => {
  // Buscar usuario por email
  const resultado = await pool.query(
    'SELECT id, nombre, email, activo FROM usuarios WHERE email = $1',
    [email]
  );

  const usuario = resultado.rows[0];

  // No revelar si el email existe o no (seguridad)
  if (!usuario) {
    // Log silencioso para debugging
    console.log(`[PasswordReset] Email no encontrado: ${email}`);
    return { mensaje: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
  }

  if (!usuario.activo) {
    console.log(`[PasswordReset] Usuario inactivo: ${email}`);
    return { mensaje: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
  }

  // Invalidar tokens anteriores del usuario
  await pool.query(
    'UPDATE password_reset_tokens SET usado = true WHERE usuario_id = $1 AND usado = false',
    [usuario.id]
  );

  // Generar nuevo token
  const token = generarTokenReset();

  // Guardar token en base de datos (expira en 1 hora por defecto)
  await pool.query(
    'INSERT INTO password_reset_tokens (usuario_id, token) VALUES ($1, $2)',
    [usuario.id, token]
  );

  // "Enviar" email
  await enviarEmailReset(email, token, usuario.nombre);

  return {
    mensaje: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
    // Solo en desarrollo: incluir token en respuesta para facilitar testing
    ...(process.env.NODE_ENV === 'development' && { token, resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${token}` })
  };
};

/**
 * Valida un token de restablecimiento.
 * Retorna el usuario asociado si el token es válido.
 */
const validarTokenReset = async (token) => {
  const resultado = await pool.query(
    `SELECT t.id as token_id, t.usado, t.expira_en, u.id as usuario_id, u.nombre, u.email
     FROM password_reset_tokens t
     JOIN usuarios u ON t.usuario_id = u.id
     WHERE t.token = $1`,
    [token]
  );

  const registro = resultado.rows[0];

  if (!registro) {
    const error = new Error('Token inválido');
    error.status = 400;
    throw error;
  }

  if (registro.usado) {
    const error = new Error('Este enlace ya ha sido utilizado');
    error.status = 400;
    throw error;
  }

  if (new Date(registro.expira_en) < new Date()) {
    const error = new Error('El enlace ha expirado');
    error.status = 400;
    throw error;
  }

  return {
    tokenId: registro.token_id,
    usuarioId: registro.usuario_id,
    nombre: registro.nombre,
    email: registro.email
  };
};

/**
 * Restablece la contraseña usando un token válido.
 */
const resetearPassword = async (token, nuevaPassword) => {
  // Validar token
  const tokenData = await validarTokenReset(token);

  // Validar requisitos de contraseña
  if (!nuevaPassword || nuevaPassword.length < 6) {
    const error = new Error('La contraseña debe tener al menos 6 caracteres');
    error.status = 400;
    throw error;
  }

  // Hashear nueva contraseña
  const hashPassword = await bcrypt.hash(nuevaPassword, 10);

  // Actualizar contraseña del usuario
  await pool.query(
    'UPDATE usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [hashPassword, tokenData.usuarioId]
  );

  // Marcar token como usado
  await pool.query(
    'UPDATE password_reset_tokens SET usado = true WHERE id = $1',
    [tokenData.tokenId]
  );

  return {
    mensaje: 'Contraseña actualizada exitosamente'
  };
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
  solicitarResetPassword,
  resetearPassword,
  validarTokenReset,
  adminResetPasswordDirecto
};
