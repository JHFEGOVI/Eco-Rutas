const fetch = require('node-fetch');

/**
 * Crea un vehículo en la API externa del profesor.
 * @param {{ placa, marca, modelo, activo, perfil_id }} vehiculo
 * @returns {string|null} UUID del vehículo externo, o null si falla
 */
const crearVehiculoExterno = async ({ placa, marca, modelo, activo, perfil_id }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/vehiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placa, marca, modelo, activo, perfil_id }),
    });

    if (!respuesta.ok) {
      const texto = await respuesta.text();
      throw new Error(`Error en la API externa [${respuesta.status}]: ${texto}`);
    }

    const datos = await respuesta.json();
    return datos.id || datos.uuid || datos.data?.id || null;
  } catch (err) {
    console.error('Error al registrar vehículo en la API externa:', err.message);
    return null;
  }
};

/**
 * Crea una ruta en la API externa del profesor.
 * @param {{ nombre_ruta, perfil_id, shape }} ruta
 * @returns {string|null} UUID de la ruta externa, o null si falla
 */
const crearRutaExterna = async ({ nombre_ruta, perfil_id, shape }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/rutas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_ruta, perfil_id, shape }),
    });

    if (!respuesta.ok) {
      const texto = await respuesta.text();
      throw new Error(`Error en la API externa [${respuesta.status}]: ${texto}`);
    }

    const datos = await respuesta.json();
    return datos.id || datos.uuid || datos.data?.id || null;
  } catch (err) {
    console.error('Error al registrar ruta en la API externa:', err.message);
    return null;
  }
};

/**
 * Crea o inicia un recorrido en la API externa del profesor.
 * @param {{ ruta_id, vehiculo_id, perfil_id }} recorrido
 * @returns {string|null} UUID del recorrido externo, o null si falla
 */
const crearRecorridoExterno = async ({ ruta_id, vehiculo_id, perfil_id }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/recorridos/iniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruta_id, vehiculo_id, perfil_id }),
    });

    if (!respuesta.ok) {
      const texto = await respuesta.text();
      throw new Error(`Error en la API externa [${respuesta.status}]: ${texto}`);
    }

    const datos = await respuesta.json();
    return datos.id || datos.uuid || datos.data?.id || null;
  } catch (err) {
    console.error('Error al registrar recorrido en la API externa:', err.message);
    return null;
  }
};

/**
 * Registra una posición GPS en un recorrido externo.
 */
const registrarPosicionExterna = async ({ recorridoExternalId, lat, lon, perfilId }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/recorridos/${recorridoExternalId}/posiciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, perfil_id: perfilId }),
    });

    if (!respuesta.ok) {
      const texto = await respuesta.text();
      console.warn(`Advertencia al enviar posición a API externa [${respuesta.status}]: ${texto}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error de red al enviar posición a la API externa:', err.message);
    return false;
  }
};

module.exports = { crearVehiculoExterno, crearRutaExterna, crearRecorridoExterno, registrarPosicionExterna };
