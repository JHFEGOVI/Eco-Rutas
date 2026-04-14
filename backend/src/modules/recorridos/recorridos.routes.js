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

router.post('/iniciar', auth, roles(['conductor']), iniciarController);
router.post('/:id/finalizar', auth, roles(['conductor']), finalizarController);
router.get('/activo', auth, roles(['conductor']), activoController);
router.post('/:id/posiciones', auth, roles(['conductor']), registrarPosicionController);
// Endpoint público para la app ciudadano (sin autenticación)
router.get('/activos-publico', activosPublicoController);

module.exports = router;
