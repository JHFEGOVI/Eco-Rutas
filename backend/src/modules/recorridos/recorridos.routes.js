const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  iniciarController,
  finalizarController,
  activoController
} = require('./recorridos.controller');

const router = Router();

router.post('/iniciar', auth, roles(['conductor']), iniciarController);
router.post('/:id/finalizar', auth, roles(['conductor']), finalizarController);
router.get('/activo', auth, roles(['conductor']), activoController);

module.exports = router;
