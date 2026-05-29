const pool = require('../../config/database');

const obtenerMetricas = async () => {
  const [
    resRecorridosEnCurso,
    resCompletadasHoy,
    resVehiculosOperativos,
    resFotosHoy
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM recorridos WHERE estado = 'en_curso'`),
    pool.query(`SELECT COUNT(*)::int AS total FROM recorridos WHERE estado = 'completado' AND timestamp_fin::date = (NOW() AT TIME ZONE 'America/Bogota')::date`),
    pool.query(`SELECT COUNT(*)::int AS total FROM vehiculos WHERE estado = 'operativo'`),
    pool.query(`SELECT COUNT(*)::int AS total FROM reportes_foto WHERE created_at::date = (NOW() AT TIME ZONE 'America/Bogota')::date`)
  ]);

  return {
    recorridos_en_curso: resRecorridosEnCurso.rows[0].total,
    completadas_hoy: resCompletadasHoy.rows[0].total,
    vehiculos_operativos: resVehiculosOperativos.rows[0].total,
    fotos_hoy: resFotosHoy.rows[0].total
  };
};

module.exports = { obtenerMetricas };
