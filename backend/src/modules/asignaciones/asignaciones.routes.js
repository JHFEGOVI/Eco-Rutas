const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  obtenerTodasController,
  obtenerPorIdController,
  obtenerPorConductorController,
  crearController,
  cambiarEstadoController,
} = require('./asignaciones.controller');

const router = Router();

// IMPORTANTE: /conductor/:conductorId debe ir ANTES de /:id
// para que Express no interprete "conductor" como un UUID

/**
 * @swagger
 * /api/asignaciones/conductor/{conductorId}:
 *   get:
 *     summary: Obtener asignaciones de un conductor específico
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conductorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del conductor.
 *     responses:
 *       200:
 *         description: Lista de asignaciones del conductor.
 *       404:
 *         description: Conductor no encontrado.
 */
router.get('/conductor/:conductorId', auth, obtenerPorConductorController);

/**
 * @swagger
 * /api/asignaciones:
 *   get:
 *     summary: Listar todas las asignaciones (solo admin)
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las asignaciones.
 *       403:
 *         description: No tienes permisos de administrador.
 */
router.get('/',        auth, roles(['admin']), obtenerTodasController);

/**
 * @swagger
 * /api/asignaciones/{id}:
 *   get:
 *     summary: Obtener una asignación por ID
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos de la asignación.
 *       404:
 *         description: Asignación no encontrada.
 */
router.get('/:id',     auth,                  obtenerPorIdController);

/**
 * @swagger
 * /api/asignaciones:
 *   post:
 *     summary: Crear una nueva asignación
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conductor_id, ruta_id, fecha]
 *             properties:
 *               conductor_id:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               ruta_id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-15"
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       403:
 *         description: Sin permisos de administrador.
 */
router.post('/',       auth, roles(['admin']), crearController);

/**
 * @swagger
 * /api/asignaciones/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una asignación
 *     tags: [Asignaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_curso, completada, cancelada]
 *                 example: "cancelada"
 *     responses:
 *       200:
 *         description: Estado actualizado.
 *       400:
 *         description: Estado inválido.
 *       404:
 *         description: Asignación no encontrada.
 */
router.patch('/:id/estado', auth, roles(['admin']), cambiarEstadoController);

module.exports = router;
