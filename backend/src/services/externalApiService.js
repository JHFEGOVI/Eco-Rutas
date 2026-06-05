const fetch = require('node-fetch');

// UUID del perfil del grupo en la API externa del profesor
const PERFIL_ID_EXTERNO = '0e272119-5ea5-4db2-85ac-475792a7367f';

/**
 * Crea un vehículo en la API externa del profesor.
 * @param {{ placa, marca, modelo, activo }} vehiculo
 * @returns {string|null} UUID del vehículo externo, o null si falla
 */
const crearVehiculoExterno = async ({ placa, marca, modelo, activo }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/vehiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placa, marca, modelo, activo, perfil_id: PERFIL_ID_EXTERNO }),
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
 * @param {{ nombre_ruta, shape }} ruta
 * @returns {string|null} UUID de la ruta externa, o null si falla
 */
const crearRutaExterna = async ({ nombre_ruta, shape }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/rutas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_ruta, perfil_id: PERFIL_ID_EXTERNO, shape }),
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
 * Inicia un recorrido en la API externa del profesor.
 * Recibe los external_id de la ruta y el vehículo.
 * @param {{ ruta_external_id, vehiculo_external_id }} recorrido
 * @returns {string|null} UUID del recorrido externo, o null si falla
 */
const crearRecorridoExterno = async ({ ruta_external_id, vehiculo_external_id }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/recorridos/iniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ruta_id: ruta_external_id,
        vehiculo_id: vehiculo_external_id,
        perfil_id: PERFIL_ID_EXTERNO
      }),
    });

    if (!respuesta.ok) {
      const texto = await respuesta.text();
      throw new Error(`Error en la API externa [${respuesta.status}]: ${texto}`);
    }

    const datos = await respuesta.json();
    console.log('Respuesta API externa recorrido:', JSON.stringify(datos));
    return datos.id || datos.uuid || datos.data?.id || null;
  } catch (err) {
    console.error('Error al registrar recorrido en la API externa:', err.message);
    return null;
  }
};

/**
 * Registra una posición GPS en un recorrido externo.
 * @param {{ recorridoExternalId, lat, lon }} posicion
 * @returns {string|null} UUID de la posición creada, o null si falló
 */
const registrarPosicionExterna = async ({ recorridoExternalId, lat, lon }) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/recorridos/${recorridoExternalId}/posiciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, perfil_id: PERFIL_ID_EXTERNO }),
    });

    if (!respuesta.ok) {
      const texto = await respuesta.text();
      console.warn(`Advertencia al enviar posición a API externa [${respuesta.status}]: ${texto}`);
      return null;
    }
    const datos = await respuesta.json();
    return datos.id || null;
  } catch (err) {
    console.error('Error de red al enviar posición a la API externa:', err.message);
    return null;
  }
};

/**
 * Sube una foto (base64) asociada a una posición en la API externa del profesor.
 * @param {{ external_posicion_id: string, foto_base64: string }} datos
 * @returns {boolean} true si fue exitoso, false si falló
 */
const subirFotoExterna = async ({ external_posicion_id, foto_base64 }) => {
  try {
    const respuesta = await fetch(
      `${process.env.EXTERNAL_API_URL}/api/recorridos/posiciones/${external_posicion_id}/imagen`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagen_base64: foto_base64 }),
      }
    );

    if (!respuesta.ok) {
      const texto = await respuesta.text();
      console.warn(`Advertencia al subir foto a API externa [${respuesta.status}]: ${texto}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error de red al subir foto a la API externa:', err.message);
    return false;
  }
};

/**
 * Finaliza un recorrido en la API externa del profesor.
 * @param {string} recorridoExternalId
 * @returns {boolean} true si fue exitoso, false si falló
 */
const finalizarRecorridoExterno = async (recorridoExternalId) => {
  try {
    const respuesta = await fetch(`${process.env.EXTERNAL_API_URL}/api/recorridos/${recorridoExternalId}/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const status = respuesta.status;
    const body = await respuesta.text();
    console.log(`[finalizarRecorridoExterno] Respuesta de API Externa - Status Code: ${status}, Body: ${body}`);

    if (!respuesta.ok) {
      console.warn(`Advertencia al finalizar recorrido externo [${status}]: ${body}`);
      console.error(`[finalizarRecorridoExterno] Error no exitoso (Completo). Status Code: ${status}, Body: ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error de red al finalizar recorrido en la API externa:', err);
    return false;
  }
};

module.exports = { crearVehiculoExterno, crearRutaExterna, crearRecorridoExterno, registrarPosicionExterna, subirFotoExterna, finalizarRecorridoExterno };
