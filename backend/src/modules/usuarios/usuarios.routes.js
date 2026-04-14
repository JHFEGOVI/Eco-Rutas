const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  obtenerTodosController,
  obtenerPorIdController,
  crearController,
  actualizarController,
  desactivarController,
  activarController,
} = require('./usuarios.controller');

const router = Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los usuarios del sistema.
 *       403:
 *         description: No tienes permisos de administrador.
 */
router.get('/',       auth, roles(['admin']),   obtenerTodosController);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del usuario.
 *       404:
 *         description: Usuario no encontrado.
 */
router.get('/:id',    auth,                     obtenerPorIdController);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, rol]
 *             properties:
 *               username:
 *                 type: string
 *                 example: "conductor01"
 *               password:
 *                 type: string
 *                 example: "contraseña123"
 *               rol:
 *                 type: string
 *                 enum: [admin, conductor]
 *                 example: "conductor"
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *       400:
 *         description: Datos inválidos o username ya existe.
 */
router.post('/',      auth, roles(['admin']),   crearController);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado.
 *       404:
 *         description: Usuario no encontrado.
 */
router.put('/:id',    auth, roles(['admin']),   actualizarController);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Desactivar un conductor (soft delete)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario desactivado.
 *       404:
 *         description: Usuario no encontrado.
 */
router.delete('/:id', auth, roles(['admin']),   desactivarController);

/**
 * @swagger
 * /api/usuarios/{id}/activar:
 *   patch:
 *     summary: Reactivar un conductor desactivado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario reactivado.
 *       404:
 *         description: Usuario no encontrado.
 */
router.patch('/:id/activar', auth, roles(['admin']), activarController);

module.exports = router;
