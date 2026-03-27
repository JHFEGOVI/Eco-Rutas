const servicio = require('./asignaciones.service');

const obtenerTodasController = async (req, res, next) => {
  try {
    const datos = await servicio.obtenerTodas();
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const obtenerPorIdController = async (req, res, next) => {
  try {
    const datos = await servicio.obtenerPorId(req.params.id);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const obtenerPorConductorController = async (req, res, next) => {
  try {
    const datos = await servicio.obtenerPorConductor(req.params.conductorId);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const crearController = async (req, res, next) => {
  try {
    const datos = await servicio.crear(req.body);
    res.status(201).json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const cambiarEstadoController = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const datos = await servicio.cambiarEstado(req.params.id, estado);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerTodasController,
  obtenerPorIdController,
  obtenerPorConductorController,
  crearController,
  cambiarEstadoController,
};
