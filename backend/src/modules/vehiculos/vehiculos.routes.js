const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  obtenerTodosController,
  obtenerPorIdController,
  crearController,
  actualizarController,
  eliminarController,
  activarController,
} = require('./vehiculos.controller');

const router = Router();

/**
 * @swagger
 * /api/vehiculos:
 *   get:
 *     summary: Listar todos los vehículos activos
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vehículos (excluyendo inactivos).
 *       401:
 *         description: Token no proporcionado o inválido.
 */
router.get('/',       auth,                    obtenerTodosController);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   get:
 *     summary: Obtener un vehículo por ID
 *     tags: [Vehículos]
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
 *         description: Datos del vehículo.
 *       404:
 *         description: Vehículo no encontrado.
 */
router.get('/:id',    auth,                    obtenerPorIdController);

/**
 * @swagger
 * /api/vehiculos:
 *   post:
 *     summary: Crear un vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [placa, marca, modelo]
 *             properties:
 *               placa:
 *                 type: string
 *                 example: "ABC-123"
 *               marca:
 *                 type: string
 *                 example: "Mercedes"
 *               modelo:
 *                 type: string
 *                 example: "Atego 1725"
 *               capacidad_kg:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente.
 *       400:
 *         description: Formato de placa inválido u otros errores de validación.
 *       403:
 *         description: No tienes permisos para esta acción.
 */
router.post('/',      auth, roles(['admin']),   crearController);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   put:
 *     summary: Actualizar un vehículo
 *     tags: [Vehículos]
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
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [operativo, averiado]
 *     responses:
 *       200:
 *         description: Vehículo actualizado.
 *       404:
 *         description: Vehículo no encontrado.
 */
router.put('/:id',    auth, roles(['admin']),   actualizarController);

/**
 * @swagger
 * /api/vehiculos/{id}:
 *   delete:
 *     summary: Desactivar un vehículo (soft delete)
 *     tags: [Vehículos]
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
 *         description: Vehículo desactivado. Ya no aparece en la lista.
 *       404:
 *         description: Vehículo no encontrado.
 */
router.delete('/:id', auth, roles(['admin']),   eliminarController);

/**
 * @swagger
 * /api/vehiculos/{id}/activar:
 *   patch:
 *     summary: Reactivar un vehículo desactivado
 *     tags: [Vehículos]
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
 *         description: Vehículo reactivado (estado operativo).
 *       404:
 *         description: Vehículo no encontrado.
 */
router.patch('/:id/activar', auth, roles(['admin']), activarController);

module.exports = router;
