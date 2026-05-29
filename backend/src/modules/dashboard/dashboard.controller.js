const dashboardService = require('./dashboard.service');

const obtenerMetricas = async (req, res, next) => {
  try {
    const metricas = await dashboardService.obtenerMetricas();
    res.json({
      success: true,
      data: metricas
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerMetricas };
