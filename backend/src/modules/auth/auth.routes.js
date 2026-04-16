const { Router } = require('express');
const { loginController, obtenerUsuarioActualController, adminResetPasswordController } = require('./auth.controller');
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
