const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  guardarFotoController,
  obtenerTodasController,
  obtenerPorRecorridoController,
  obtenerFotoPorIdController,
} = require('./reportes.controller');

const router = Router();

/**
 * @swagger
 * /api/reportes:
 *   post:
 *     summary: Guardar una foto de reporte durante un recorrido
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recorrido_id, posicion_id, foto_base64]
 *             properties:
 *               recorrido_id:
 *                 type: string
 *                 format: uuid
 *                 example: "a1b2c3d4-..."
 *               posicion_id:
 *                 type: string
 *                 format: uuid
 *                 example: "e5f6g7h8-..."
 *               foto_base64:
 *                 type: string
 *                 description: Imagen codificada en Base64
 *                 example: "data:image/jpeg;base64,/9j/4AAQ..."
 *     responses:
 *       201:
 *         description: Foto guardada exitosamente.
 *       400:
 *         description: Faltan campos obligatorios.
 *       401:
 *         description: Token no proporcionado o inválido.
 */
router.post('/', auth, guardarFotoController);

/**
 * @swagger
 * /api/reportes:
 *   get:
 *     summary: Obtener todas las fotos de reporte (solo admin)
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de fotos con conductor y ruta.
 *       401:
 *         description: Token no proporcionado o inválido.
 *       403:
 *         description: No tienes permiso para esta acción.
 */
router.get('/', auth, roles(['admin']), obtenerTodasController);

/**
 * @swagger
 * /api/reportes/recorrido/{id}:
 *   get:
 *     summary: Obtener las fotos de un recorrido específico
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del recorrido
 *     responses:
 *       200:
 *         description: Lista de fotos del recorrido con conductor y ruta.
 *       401:
 *         description: Token no proporcionado o inválido.
 */
router.get('/recorrido/:id', auth, obtenerPorRecorridoController);

/**
 * @swagger
 * /api/reportes/{id}/foto:
 *   get:
 *     summary: Obtener una foto específica por su ID
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID de la foto
 *     responses:
 *       200:
 *         description: Datos de la foto incluyendo base64.
 *       404:
 *         description: Foto no encontrada.
 */
router.get('/:id/foto', auth, obtenerFotoPorIdController);

module.exports = router;
