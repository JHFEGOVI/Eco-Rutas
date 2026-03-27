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
router.get('/conductor/:conductorId', auth, obtenerPorConductorController);

router.get('/',        auth, roles(['admin']), obtenerTodasController);
router.get('/:id',     auth,                  obtenerPorIdController);
router.post('/',       auth, roles(['admin']), crearController);
router.patch('/:id/estado', auth, roles(['admin']), cambiarEstadoController);

module.exports = router;
