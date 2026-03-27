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

router.get('/',       auth,                    obtenerTodasController);
router.get('/:id',    auth,                    obtenerPorIdController);
router.post('/',      auth, roles(['admin']),   crearController);
router.put('/:id',    auth, roles(['admin']),   actualizarController);
router.delete('/:id', auth, roles(['admin']),   desactivarController);

module.exports = router;
