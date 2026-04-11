const servicio = require('./recorridos.service');

const iniciarController = async (req, res, next) => {
  try {
    const conductorId = req.user.id;
    const datos = await servicio.iniciarRecorrido(conductorId);
    res.status(201).json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const finalizarController = async (req, res, next) => {
  try {
    const recorridoId = req.params.id;
    const conductorId = req.user.id;
    const datos = await servicio.finalizarRecorrido(recorridoId, conductorId);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const activoController = async (req, res, next) => {
  try {
    const conductorId = req.user.id;
    const datos = await servicio.obtenerRecorridoActivo(conductorId);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  iniciarController,
  finalizarController,
  activoController
};
