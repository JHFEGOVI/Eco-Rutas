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

const registrarPosicionController = async (req, res, next) => {
  try {
    const recorridoId = req.params.id;
    const { lat, lon } = req.body;
    const conductorId = req.user.id;
    
    // Fallback por si mandan strings vacios o malformados
    if (lat === undefined || lon === undefined) {
      const err = new Error('Las coordenadas lat y lon son obligatorias');
      err.status = 400;
      throw err;
    }
    
    const datos = await servicio.registrarPosicion(recorridoId, lat, lon, conductorId);
    res.status(201).json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  iniciarController,
  finalizarController,
  activoController,
  registrarPosicionController
};
