const servicio = require('./vehiculos.service');

const obtenerTodosController = async (req, res, next) => {
  try {
    const datos = await servicio.getAll();
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const obtenerPorIdController = async (req, res, next) => {
  try {
    const datos = await servicio.getById(req.params.id);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const crearController = async (req, res, next) => {
  try {
    const datos = await servicio.create(req.body);
    res.status(201).json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const actualizarController = async (req, res, next) => {
  try {
    const datos = await servicio.update(req.params.id, req.body);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const eliminarController = async (req, res, next) => {
  try {
    const datos = await servicio.remove(req.params.id);
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
  eliminarController,
};
