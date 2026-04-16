const { Router } = require('express');
const { loginController, obtenerUsuarioActualController, forgotPasswordController, resetPasswordController, adminResetPasswordController } = require('./auth.controller');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y retorna un token JWT.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna el token JWT y datos del usuario.
 *       400:
 *         description: Credenciales inválidas o campos faltantes.
 *       401:
 *         description: Usuario o contraseña incorrectos.
 */
router.post('/login', loginController);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     description: Retorna los datos actuales del usuario logueado.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario.
 *       401:
 *         description: Token inválido o no proporcionado.
 *       404:
 *         description: Usuario no encontrado.
 */
router.get('/me', auth, obtenerUsuarioActualController);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Genera un token de restablecimiento y envía email (en desarrollo lo loguea).
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@ecorutas.com"
 *     responses:
 *       200:
 *         description: Email de recuperación enviado (o logueado en desarrollo).
 *       400:
 *         description: Email no proporcionado.
 */
router.post('/forgot-password', forgotPasswordController);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Usa el token de recuperación para establecer una nueva contraseña.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123..."
 *               password:
 *                 type: string
 *                 example: "nuevaContrasena123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente.
 *       400:
 *         description: Token inválido, expirado o contraseña no cumple requisitos.
 */
router.post('/reset-password', resetPasswordController);

/**
 * @swagger
 * /api/auth/admin-reset:
 *   post:
 *     summary: Restablecer contraseña de admin (flujo simplificado)
 *     description: |
 *       Permite restablecer la contraseña de un administrador verificando solo el username.
 *       No requiere email ni tokens - uso directo para recuperación de acceso.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *                 description: "Nombre de usuario del administrador"
 *               password:
 *                 type: string
 *                 example: "nuevaContrasena123"
 *                 description: "Nueva contraseña (mínimo 6 caracteres)"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente.
 *       400:
 *         description: Campos faltantes o contraseña muy corta.
 *       404:
 *         description: Usuario no encontrado.
 *       403:
 *         description: Usuario inactivo.
 */
router.post('/admin-reset', auth, roles(['admin']), adminResetPasswordController);

module.exports = router;
