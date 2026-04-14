const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  iniciarController,
  finalizarController,
  activoController,
  registrarPosicionController,
  activosPublicoController
} = require('./recorridos.controller');

const router = Router();

/**
 * @swagger
 * /api/recorridos/activos-publico:
 *   get:
 *     summary: Listar todos los recorridos activos (público, sin autenticación)
 *     description: Endpoint público para la app ciudadano. Incluye nombre de la ruta, geometría GeoJSON, placa del vehículo y última posición GPS.
 *     tags: [Recorridos]
 *     responses:
 *       200:
 *         description: Lista de recorridos en curso con datos de ruta y posición.
 */
router.get('/activos-publico', activosPublicoController);

/**
 * @swagger
 * /api/recorridos/activo:
 *   get:
 *     summary: Obtener el recorrido activo del conductor autenticado
 *     tags: [Recorridos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del recorrido en curso del conductor, o null si no hay ninguno.
 *       401:
 *         description: Token inválido.
 *       403:
 *         description: Solo conductores pueden usar este endpoint.
 */
router.get('/activo', auth, roles(['conductor']), activoController);

/**
 * @swagger
 * /api/recorridos/iniciar:
 *   post:
 *     summary: Iniciar un recorrido (conductor)
 *     description: Busca la primera asignación pendiente del día y el primer vehículo disponible. Crea el recorrido y actualiza el estado de la asignación a 'en_curso'.
 *     tags: [Recorridos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Recorrido iniciado exitosamente. Retorna datos del recorrido con ruta y vehículo.
 *       400:
 *         description: No hay asignaciones pendientes para hoy, o no hay vehículos disponibles.
 *       403:
 *         description: Solo conductores pueden iniciar recorridos.
 */
router.post('/iniciar', auth, roles(['conductor']), iniciarController);

/**
 * @swagger
 * /api/recorridos/{id}/finalizar:
 *   post:
 *     summary: Finalizar un recorrido activo
 *     tags: [Recorridos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recorrido a finalizar.
 *     responses:
 *       200:
 *         description: Recorrido finalizado. Actualiza la asignación a 'completada'.
 *       404:
 *         description: Recorrido no encontrado o no pertenece al conductor.
 */
router.post('/:id/finalizar', auth, roles(['conductor']), finalizarController);

/**
 * @swagger
 * /api/recorridos/{id}/posiciones:
 *   post:
 *     summary: Registrar una posición GPS
 *     description: Guarda las coordenadas GPS del camión. Si existe external_id, intenta sincronizar con la API externa.
 *     tags: [Recorridos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recorrido activo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lat, lon]
 *             properties:
 *               lat:
 *                 type: number
 *                 example: 3.8801
 *               lon:
 *                 type: number
 *                 example: -77.0311
 *     responses:
 *       201:
 *         description: Posición guardada exitosamente.
 *       400:
 *         description: Lat o lon faltantes.
 *       404:
 *         description: Recorrido no encontrado o ya finalizado.
 */
router.post('/:id/posiciones', auth, roles(['conductor']), registrarPosicionController);

module.exports = router;
