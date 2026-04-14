require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = require('../src/config/database');
const fetch = require('node-fetch');

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;
const PERFIL_ID = '0e272119-5ea5-4db2-85ac-475792a7367f';

// ─── Sincronizar Vehículos ──────────────────────────────────────────────────
async function sincronizarVehiculos() {
  console.log('\n🚛  Sincronizando vehículos sin external_id...');
  const { rows: vehiculos } = await pool.query(
    `SELECT id, placa, marca, modelo FROM vehiculos WHERE external_id IS NULL`
  );

  if (vehiculos.length === 0) {
    console.log('   ✓ No hay vehículos pendientes.');
    return;
  }

  for (const v of vehiculos) {
    try {
      const respuesta = await fetch(`${EXTERNAL_API_URL}/api/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: v.placa,
          marca: v.marca,
          modelo: v.modelo,
          activo: true,
          perfil_id: PERFIL_ID,
        }),
      });

      if (!respuesta.ok) {
        const texto = await respuesta.text();
        console.error(`   ✗ [${v.placa}] Error HTTP ${respuesta.status}: ${texto}`);
        continue;
      }

      const datos = await respuesta.json();
      const externalId = datos.id || datos.uuid || datos.data?.id || null;

      if (externalId) {
        await pool.query(`UPDATE vehiculos SET external_id = $1 WHERE id = $2`, [externalId, v.id]);
        console.log(`   ✓ [${v.placa}] Sincronizado → external_id: ${externalId}`);
      } else {
        console.warn(`   ⚠ [${v.placa}] La API externa no devolvió un ID.`);
      }
    } catch (err) {
      console.error(`   ✗ [${v.placa}] Error de red: ${err.message}`);
    }
  }
}

// ─── Sincronizar Rutas ──────────────────────────────────────────────────────
async function sincronizarRutas() {
  console.log('\n🗺️  Sincronizando rutas sin external_id...');
  const { rows: rutas } = await pool.query(
    `SELECT id, nombre, descripcion, ST_AsGeoJSON(geometria)::json AS geometria
     FROM rutas
     WHERE external_id IS NULL AND geometria IS NOT NULL`
  );

  if (rutas.length === 0) {
    console.log('   ✓ No hay rutas pendientes.');
    return;
  }

  for (const r of rutas) {
    try {
      const respuesta = await fetch(`${EXTERNAL_API_URL}/api/rutas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_ruta: r.nombre,
          perfil_id: PERFIL_ID,
          shape: r.geometria,
        }),
      });

      if (!respuesta.ok) {
        const texto = await respuesta.text();
        console.error(`   ✗ [${r.nombre}] Error HTTP ${respuesta.status}: ${texto}`);
        continue;
      }

      const datos = await respuesta.json();
      const externalId = datos.id || datos.uuid || datos.data?.id || null;

      if (externalId) {
        await pool.query(`UPDATE rutas SET external_id = $1 WHERE id = $2`, [externalId, r.id]);
        console.log(`   ✓ [${r.nombre}] Sincronizada → external_id: ${externalId}`);
      } else {
        console.warn(`   ⚠ [${r.nombre}] La API externa no devolvió un ID.`);
      }
    } catch (err) {
      console.error(`   ✗ [${r.nombre}] Error de red: ${err.message}`);
    }
  }
}

// ─── Sincronizar Conductores ────────────────────────────────────────────────
async function sincronizarConductores() {
  console.log('\n👤  Actualizando external_perfil_id de todos los conductores...');
  const resultado = await pool.query(
    `UPDATE usuarios SET external_perfil_id = $1
     WHERE rol = 'conductor'
     RETURNING id, username`,
    [PERFIL_ID]
  );

  const cantidad = resultado.rowCount;
  if (cantidad === 0) {
    console.log('   ✓ No hay conductores para actualizar.');
  } else {
    for (const u of resultado.rows) {
      console.log(`   ✓ Conductor [${u.username}] → external_perfil_id: ${PERFIL_ID}`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('══════════════════════════════════════════════');
  console.log('   Script de Sincronización con API Externa    ');
  console.log(`   Perfil fijo: ${PERFIL_ID}`);
  console.log('══════════════════════════════════════════════');

  try {
    await sincronizarVehiculos();
    await sincronizarRutas();
    await sincronizarConductores();

    console.log('\n✅ Sincronización finalizada exitosamente.');
  } catch (err) {
    console.error('\n❌ Error inesperado durante sincronización:', err.message);
  } finally {
    await pool.end();
  }
})();
