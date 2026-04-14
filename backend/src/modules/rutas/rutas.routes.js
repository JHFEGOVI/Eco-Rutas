const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  obtenerTodasController,
  obtenerPorIdController,
  crearController,
  actualizarController,
  desactivarController,
} = require('./rutas.controller');

const router = Router();

/**
 * @swagger
 * /api/rutas:
 *   get:
 *     summary: Listar todas las rutas activas
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rutas con su geometría GeoJSON.
 *       401:
 *         description: Token inválido.
 */
router.get('/',       auth,                    obtenerTodasController);

/**
 * @swagger
 * /api/rutas/{id}:
 *   get:
 *     summary: Obtener una ruta por ID
 *     tags: [Rutas]
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
 *         description: Datos de la ruta con coordenadas GeoJSON.
 *       404:
 *         description: Ruta no encontrada.
 */
router.get('/:id',    auth,                    obtenerPorIdController);

/**
 * @swagger
 * /api/rutas:
 *   post:
 *     summary: Crear una ruta con trayecto GeoJSON
 *     tags: [Rutas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, geometria]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Ruta Centro"
 *               descripcion:
 *                 type: string
 *                 example: "Recolección zona centro de Buenaventura"
 *               geometria:
 *                 type: object
 *                 description: GeoJSON del tipo LineString con las coordenadas del recorrido.
 *                 example:
 *                   type: "LineString"
 *                   coordinates: [[-77.03, 3.88], [-77.02, 3.89]]
 *     responses:
 *       201:
 *         description: Ruta creada correctamente.
 *       400:
 *         description: Geometría inválida u otros errores.
 */
router.post('/',      auth, roles(['admin']),   crearController);

/**
 * @swagger
 * /api/rutas/{id}:
 *   put:
 *     summary: Actualizar una ruta existente
 *     tags: [Rutas]
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
 *               descripcion:
 *                 type: string
 *               geometria:
 *                 type: object
 *     responses:
 *       200:
 *         description: Ruta actualizada.
 *       404:
 *         description: Ruta no encontrada.
 */
router.put('/:id',    auth, roles(['admin']),   actualizarController);

/**
 * @swagger
 * /api/rutas/{id}:
 *   delete:
 *     summary: Desactivar una ruta (soft delete)
 *     tags: [Rutas]
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
 *         description: Ruta desactivada.
 *       404:
 *         description: Ruta no encontrada.
 */
router.delete('/:id', auth, roles(['admin']),   desactivarController);

module.exports = router;
