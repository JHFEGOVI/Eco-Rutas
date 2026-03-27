const { Router } = require('express');
const auth = require('../../middleware/auth');
const roles = require('../../middleware/roles');
const {
  obtenerTodosController,
  obtenerPorIdController,
  crearController,
  actualizarController,
  eliminarController,
} = require('./vehiculos.controller');

const router = Router();

router.get('/',       auth,                    obtenerTodosController);
router.get('/:id',    auth,                    obtenerPorIdController);
router.post('/',      auth, roles(['admin']),   crearController);
router.put('/:id',    auth, roles(['admin']),   actualizarController);
router.delete('/:id', auth, roles(['admin']),   eliminarController);

module.exports = router;
