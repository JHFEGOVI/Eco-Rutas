const { Router } = require('express');
const { loginController, obtenerUsuarioActualController } = require('./auth.controller');
const auth = require('../../middleware/auth');

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

module.exports = router;
