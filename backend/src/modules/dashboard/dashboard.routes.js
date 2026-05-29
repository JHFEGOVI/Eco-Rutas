const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Métricas y estadísticas para el panel de administración
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Obtiene las métricas generales del sistema
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     recorridos_en_curso:
 *                       type: integer
 *                     completadas_hoy:
 *                       type: integer
 *                     vehiculos_operativos:
 *                       type: integer
 *                     fotos_hoy:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (requiere rol admin)
 */
router.get('/', auth, roles(['admin']), dashboardController.obtenerMetricas);

module.exports = router;
