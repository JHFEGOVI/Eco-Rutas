const servicio = require('./reportes.service');
const { subirFotoExterna } = require('../../services/externalApiService');

/**
 * POST /api/reportes
 * Guarda la foto en la BD local e intenta subirla a la API externa.
 * Body: { recorrido_id, posicion_id, foto_base64 }
 */
const guardarFotoController = async (req, res, next) => {
  try {
    const { recorrido_id, posicion_id, foto_base64 } = req.body;

    if (!recorrido_id || !posicion_id || !foto_base64) {
      const error = new Error('recorrido_id, posicion_id y foto_base64 son obligatorios');
      error.status = 400;
      throw error;
    }

    // Buscar el external_posicion_id de la posición local
    const pool = require('../../config/database');
    const posicionQuery = await pool.query(
      'SELECT external_id FROM posiciones WHERE id = $1',
      [posicion_id]
    );
    const external_posicion_id = posicionQuery.rows[0]?.external_id || null;

    // Guardar en BD local
    const reporte = await servicio.guardarFoto({
      recorrido_id,
      posicion_id,
      foto_base64,
      external_posicion_id,
    });

    // Intentar subir a la API externa (no bloquea si falla)
    if (external_posicion_id) {
      const exito = await subirFotoExterna({ external_posicion_id, foto_base64 });
      if (!exito) {
        console.warn(`[Reportes] Foto guardada localmente pero no pudo subirse a la API externa (posición externa: ${external_posicion_id})`);
      }
    }

    res.status(201).json({ success: true, data: reporte });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reportes
 * Retorna todas las fotos (solo admin).
 */
const obtenerTodasController = async (req, res, next) => {
  try {
    const datos = await servicio.obtenerTodasLasFotos();
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reportes/recorrido/:id
 * Retorna las fotos de un recorrido específico.
 */
const obtenerPorRecorridoController = async (req, res, next) => {
  try {
    const datos = await servicio.obtenerFotosPorRecorrido(req.params.id);
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reportes/:id/foto
 * Retorna una sola foto con su base64.
 */
const obtenerFotoPorIdController = async (req, res, next) => {
  try {
    const datos = await servicio.obtenerFotoPorId(req.params.id);
    if (!datos) {
      const error = new Error('Foto no encontrada');
      error.status = 404;
      throw error;
    }
    res.json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  guardarFotoController,
  obtenerTodasController,
  obtenerPorRecorridoController,
  obtenerFotoPorIdController,
};
