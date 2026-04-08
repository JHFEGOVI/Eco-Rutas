const servicio = require('./usuarios.service');

const obtenerTodosController = async (req, res, next) => {
  try {
    const datos = await servicio.obtenerTodos();
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

const crearController = async (req, res, next) => {
  try {
    const datos = await servicio.crear(req.body);
    res.status(201).json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const actualizarController = async (req, res, next) => {
  try {
    const datos = await servicio.actualizar(req.params.id, req.body);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const desactivarController = async (req, res, next) => {
  try {
    const datos = await servicio.desactivar(req.params.id);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const activarController = async (req, res, next) => {
  try {
    const datos = await servicio.activar(req.params.id);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerTodosController,
  obtenerPorIdController,
  crearController,
  actualizarController,
  desactivarController,
  activarController,
};
