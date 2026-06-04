import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { BackgroundGeolocationPlugin, Location, CallbackError } from '@capacitor-community/background-geolocation';
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonBackButton,
  ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, arrowBackOutline, closeCircleOutline, locationOutline, flagOutline } from 'ionicons/icons';

const DB_NOMBRE = 'ecorrutas_offline';

@Component({
  selector: 'app-recorrido',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner,
    IonButtons,
    IonBackButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar class="toolbar-verde">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/rutas"></ion-back-button>
        </ion-buttons>
        <ion-title>Recorrido Activo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="false" class="fondo-verde">
      <div class="contenedor">

        @if (cargando) {
          <div class="tarjeta contenedor-centrado">
            <ion-spinner name="crescent" style="--color:#1e8c34"></ion-spinner>
            <p class="cargando-txt">Verificando estado del recorrido...</p>
          </div>

        } @else if (!recorridoActivo) {
          <div class="tarjeta contenedor-centrado">
            <div class="puntos">
              <span class="punto rojo"></span>
              <span class="punto amarillo"></span>
              <span class="punto verde-dot"></span>
            </div>
            <svg class="icono-vacio" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
            <h2 class="msg-vacio-titulo">Sin recorrido activo</h2>
            <p class="msg-vacio-sub">No tienes ningún recorrido en curso en este momento</p>
            <button class="btn-finalizar" routerLink="/rutas" style="margin-top:16px">
              <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Volver a mis rutas
            </button>
          </div>

        } @else {
          <div class="tarjeta">
            <!-- Puntos mac -->
            <div class="puntos">
              <span class="punto rojo"></span>
              <span class="punto amarillo"></span>
              <span class="punto verde-dot"></span>
            </div>

            <!-- Logo + título -->
            <div class="logo-area">
              <div class="logo-circulo">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#1e8c34">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                </svg>
              </div>
              <p class="logo-sub">RECORRIDO ACTIVO</p>
            </div>

            <!-- Ruta -->
            <div class="campo-grupo">
              <span class="campo-label">Ruta</span>
              <span class="campo-valor">{{ recorridoActivo.ruta_nombre || recorridoActivo.ruta_id }}</span>
            </div>

            <!-- Vehículo -->
            <div class="campo-grupo">
              <span class="campo-label">Vehículo asignado</span>
              <span class="campo-valor verde">{{ recorridoActivo.placa }} · {{ recorridoActivo.marca }}</span>
            </div>

            <!-- Hora inicio -->
            <div class="campo-grupo">
              <span class="campo-label">Hora de inicio</span>
              <span class="campo-valor">{{ formatearHora(recorridoActivo.timestamp_inicio) }}</span>
            </div>

            <!-- GPS -->
            <div class="campo-grupo sin-borde">
              <span class="campo-label">Ubicación actual</span>
              @if (coordenadas) {
                <span class="gps-activo">
                  <span class="gps-pulso"></span>
                  Lat: {{ coordenadas.lat | number:'1.4-4' }}, Lon: {{ coordenadas.lon | number:'1.4-4' }}
                </span>
              } @else {
                <span class="gps-buscando">
                  <ion-spinner name="dots" style="width:14px;height:14px;--color:#ff8f00"></ion-spinner>
                  Detectando satélites GPS...
                </span>
              }
            </div>

            @if (pendientesSQLite > 0) {
              <div class="alerta-offline">
                ⚠️ {{ pendientesSQLite }} posiciones sin sincronizar
              </div>
            }

            <div class="divisor"></div>

            <!-- Botón de reporte de foto -->
            <div class="reporte-row" (click)="!subiendoFoto && tomarFotoReporte()">
              <button class="btn-reporte" [disabled]="subiendoFoto">
                @if (subiendoFoto) {
                  <ion-spinner name="crescent" style="width:20px;height:20px;--color:#fff"></ion-spinner>
                } @else {
                  <svg viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
                }
              </button>
              <div class="reporte-texto">
                <strong>Reportar incidencia</strong>
                <span>Toca para tomar una foto del punto actual</span>
              </div>
            </div>

            <!-- Finalizar -->
            <button
              class="btn-finalizar"
              (click)="finalizarRecorrido()"
              [disabled]="procesando"
            >
              @if (procesando) {
                <ion-spinner name="crescent" style="width:18px;height:18px;--color:#fff"></ion-spinner>
                Finalizando...
              } @else {
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Finalizar recorrido
              }
            </button>

            <!-- Badge -->
            <div class="badge-seguro">
              <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              Conexión cifrada · EcoRutas v1.0
            </div>
          </div>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    /* Fondo igual al login */
    .fondo-verde { --background: #1e8c34; }

    .contenedor {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100%;
      padding: 20px 16px 32px;
    }

    /* ── Tarjeta blanca ── */
    .tarjeta {
      width: 100%;
      max-width: 400px;
      background: #fff;
      border-radius: 20px;
      padding: 18px 20px 20px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    }

    /* ── Estado vacío ── */
    .contenedor-centrado {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-top: 24px;
      padding-bottom: 8px;
    }
    .icono-vacio { width: 52px; height: 52px; fill: #c8e6c9; margin-bottom: 10px; }
    .msg-vacio-titulo { font-size: 1rem; font-weight: 700; color: #333; }
    .msg-vacio-sub { font-size: 0.8rem; color: #9e9e9e; margin-top: 4px; }
    .cargando-txt { color: #9e9e9e; font-size: 0.85rem; margin-top: 12px; }

    /* ── Puntos mac ── */
    .puntos { display: flex; gap: 6px; margin-bottom: 14px; }
    .punto { width: 11px; height: 11px; border-radius: 50%; }
    .rojo     { background: #ff5f57; }
    .amarillo { background: #febc2e; }
    .verde-dot{ background: #28c840; }

    /* ── Logo ── */
    .logo-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
    }
    .logo-circulo {
      width: 76px; height: 76px;
      background: #f0faf1;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid #c8e6c9;
      margin-bottom: 6px;
      animation: pulso 3s ease-in-out infinite;
    }
    @keyframes pulso {
      0%,100% { box-shadow: 0 0 0 0   rgba(30,140,52,0.2); }
      50%      { box-shadow: 0 0 0 8px rgba(30,140,52,0);   }
    }
    .logo-sub { font-size: 0.55rem; font-weight: 700; color: #9e9e9e; letter-spacing: 2px; }

    /* ── Campos info ── */
    .campo-grupo {
      display: flex; flex-direction: column; gap: 2px;
      margin-bottom: 11px; padding-bottom: 11px;
      border-bottom: 1px solid #f0f0f0;
    }
    .campo-grupo.sin-borde { border-bottom: none; margin-bottom: 0; }
    .campo-label { font-size: 0.6rem; font-weight: 700; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.8px; }
    .campo-valor { font-size: 0.88rem; color: #212121; font-weight: 600; }
    .campo-valor.verde { color: #1e8c34; }

    /* ── GPS ── */
    .gps-activo {
      display: flex; align-items: center; gap: 7px;
      color: #2e7d32; font-size: 0.82rem; font-weight: 500;
    }
    .gps-pulso {
      width: 8px; height: 8px; border-radius: 50%;
      background: #4caf50; flex-shrink: 0;
      animation: blink 1.2s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
    .gps-buscando {
      display: flex; align-items: center; gap: 6px;
      color: #ff8f00; font-size: 0.82rem;
    }

    /* ── Alerta offline ── */
    .alerta-offline {
      background: #fff3e0; border: 1px solid #ffcc80;
      border-radius: 8px; padding: 6px 10px;
      font-size: 0.75rem; color: #e65100; font-weight: 600;
      margin-top: 8px;
    }

    /* ── Divisor ── */
    .divisor { height: 1px; background: #f0f0f0; margin: 12px 0; }

    /* ── Reporte fila ── */
    .reporte-row {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 12px;
      background: #fff8e1; border-radius: 12px;
      padding: 10px 12px;
      border: 1px solid #ffe082;
      cursor: pointer;
    }
    .btn-reporte {
      width: 44px; height: 44px; border-radius: 50%;
      background: #ff8f00; border: none;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    .btn-reporte:active:not(:disabled) { background: #e65100; transform: scale(0.94); }
    .btn-reporte:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-reporte svg { width: 20px; height: 20px; fill: #fff; }
    .reporte-texto strong { display: block; font-size: 0.8rem; color: #5d4037; font-weight: 700; }
    .reporte-texto span   { font-size: 0.72rem; color: #795548; }

    /* ── Botón finalizar ── */
    .btn-finalizar {
      width: 100%; height: 48px;
      background: #1e8c34; color: #fff;
      border: none; border-radius: 12px;
      font-size: 0.95rem; font-weight: 900;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 4px 14px rgba(30,140,52,0.35);
      cursor: pointer; font-family: inherit;
      transition: background 0.15s, transform 0.1s;
    }
    .btn-finalizar:active:not(:disabled) { background: #145a24; transform: scale(0.98); }
    .btn-finalizar:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-finalizar svg { width: 18px; height: 18px; fill: #fff; }

    /* ── Badge ── */
    .badge-seguro {
      display: flex; align-items: center; justify-content: center; gap: 5px;
      font-size: 0.6rem; color: #bdbdbd; margin-top: 14px;
    }
    .badge-seguro svg { width: 11px; height: 11px; fill: #bdbdbd; }
    
    .toolbar-verde {
     --background: #1e8c34;
     --color: white;
}

  `]
})
export class RecorridoPagina implements OnInit, OnDestroy {
  cargando = true;
  procesando = false;
  subiendoFoto = false;
  recorridoActivo: any = null;
  recorridoIdUrl: string | null = null;

  coordenadas: { lat: number; lon: number } | null = null;
  private watcherId: string | null = null;
  intervaloGps: any;
  intervaloReintentos: any;
  pendientesSQLite = 0;

  ultimaPosicionId: string | null = null;
  ultimaPosicionExternalId: string | null = null;

  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private ngZone: NgZone
  ) {
    addIcons({ checkmarkDoneOutline, arrowBackOutline, closeCircleOutline, locationOutline, flagOutline });
  }

  async ngOnInit() {
    this.recorridoIdUrl = this.activatedRoute.snapshot.paramMap.get('id');
    await this.iniciarSQLite();
    await this.solicitarPermisosGps();
    this.cargarRecorridoActivo();
  }

  ngOnDestroy() {
    this.detenerTrackingYIntervalos();
    this.cerrarSQLite();
  }

  // ─── SQLite ───────────────────────────────────────────────────────────────

  async iniciarSQLite() {
    try {
      this.db = await this.sqlite.createConnection(DB_NOMBRE, false, 'no-encryption', 1, false);
      await this.db.open();
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS posiciones_pendientes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recorrido_id TEXT,
          lat REAL,
          lon REAL,
          timestamp TEXT,
          intentos INTEGER DEFAULT 0
        )
      `);
    } catch (err: any) {
      console.error('Error al iniciar SQLite:', err.message);
    }
  }

  async cerrarSQLite() {
    try {
      if (this.db) {
        await this.db.close();
        await this.sqlite.closeConnection(DB_NOMBRE, false);
      }
    } catch (err: any) {
      console.error('Error al cerrar SQLite:', err.message);
    }
  }

  async guardarPosicionOffline(lat: number, lon: number) {
    if (!this.db || !this.recorridoActivo?.id) return;
    try {
      await this.db.run(
        `INSERT INTO posiciones_pendientes (recorrido_id, lat, lon, timestamp, intentos) VALUES (?, ?, ?, ?, 0)`,
        [this.recorridoActivo.id, lat, lon, new Date().toISOString()]
      );
      await this.actualizarContadorPendientes();
    } catch (err: any) {
      console.error('Error al guardar posición offline:', err.message);
    }
  }

  async actualizarContadorPendientes() {
    if (!this.db || !this.recorridoActivo?.id) return;
    try {
      const res = await this.db.query(
        `SELECT COUNT(*) as total FROM posiciones_pendientes WHERE recorrido_id = ?`,
        [this.recorridoActivo.id]
      );
      this.pendientesSQLite = res.values?.[0]?.total ?? 0;
    } catch (err: any) {
      console.error('Error al contar pendientes SQLite:', err.message);
    }
  }

  async subirPendientesSQLite() {
    if (!this.db || !this.recorridoActivo?.id) return;
    try {
      const res = await this.db.query(
        `SELECT * FROM posiciones_pendientes WHERE recorrido_id = ? ORDER BY id ASC`,
        [this.recorridoActivo.id]
      );
      const pendientes = res.values ?? [];
      for (const pos of pendientes) {
        try {
          await firstValueFrom(
            this.http.post(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/posiciones`, {
              lat: pos.lat, lon: pos.lon
            })
          );
          await this.db.run(`DELETE FROM posiciones_pendientes WHERE id = ?`, [pos.id]);
          await this.actualizarContadorPendientes();
        } catch {
          await this.db.run(
            `UPDATE posiciones_pendientes SET intentos = intentos + 1 WHERE id = ?`,
            [pos.id]
          );
          break;
        }
      }
    } catch (err: any) {
      console.error('Error en reintento SQLite:', err.message);
    }
  }

  // ─── GPS y recorrido ──────────────────────────────────────────────────────

  async solicitarPermisosGps() {
    try {
      const permisos = await Geolocation.requestPermissions();
      if (permisos.location !== 'granted') {
        const t = await this.toastController.create({
          message: 'Sin permisos de GPS. La ruta no transmitirá la ubicación.',
          duration: 5000, color: 'warning', position: 'bottom'
        });
        await t.present();
      }
    } catch {
      console.warn('Dispositivo no soporta solicitud previa de permisos GPS');
    }
    if (Capacitor.isNativePlatform()) {
      try {
        await BackgroundGeolocation.addWatcher(
          { requestPermissions: true, stale: false },
          () => {}
        ).then(id => BackgroundGeolocation.removeWatcher({ id }));
      } catch {
        console.warn('Background geolocation: no se pudo pre-solicitar permisos');
      }
    }
  }

  cargarRecorridoActivo() {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/recorridos/activo`).subscribe({
      next: async (res) => {
        this.recorridoActivo = res.data || null;
        this.cargando = false;
        if (this.recorridoActivo?.id) {
          await this.actualizarContadorPendientes();
          this.iniciarTrackingGps();
        }
      },
      error: async (err) => {
        this.cargando = false;
        await this.mostrarError(err?.error?.message || 'Error al obtener el recorrido activo');
      }
    });
  }

  async iniciarTrackingGps() {
    if (Capacitor.isNativePlatform()) {
      this.watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'EcoRutas está registrando tu recorrido',
          backgroundTitle: 'Recorrido activo',
          requestPermissions: true,
          stale: false,
          distanceFilter: 1
        },
        (location: Location | undefined, error: CallbackError | undefined) => {
          if (error || !location) return;
          this.ngZone.run(() => {
            const pos = { lat: location.latitude, lon: location.longitude };
            this.coordenadas = pos;
            this.enviarPosicion(pos);
          });
        }
      );
    } else {
      this.tomarPosicion();
      this.intervaloGps = setInterval(() => this.tomarPosicion(), 5000);
    }
    this.intervaloReintentos = setInterval(() => this.subirPendientesSQLite(), 30000);
  }

  async detenerTrackingYIntervalos() {
    if (Capacitor.isNativePlatform()) {
      if (this.watcherId) {
        await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
        this.watcherId = null;
      }
    } else {
      if (this.intervaloGps) clearInterval(this.intervaloGps);
    }
    if (this.intervaloReintentos) clearInterval(this.intervaloReintentos);
  }

  async tomarPosicion() {
    try {
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      this.coordenadas = { lat: p.coords.latitude, lon: p.coords.longitude };
      this.enviarPosicion(this.coordenadas);
    } catch (err) {
      console.error('Fallo capturando GPS:', err);
    }
  }

  enviarPosicion(pos: { lat: number; lon: number }) {
    if (!this.recorridoActivo?.id) return;
    this.http.post<any>(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/posiciones`, pos).subscribe({
      next: (res) => {
        if (res?.data?.id) {
          this.ultimaPosicionId = res.data.id;
          this.ultimaPosicionExternalId = res.data.external_id || null;
        }
      },
      error: () => {
        this.guardarPosicionOffline(pos.lat, pos.lon);
      }
    });
  }

  async tomarFotoReporte() {
    if (!this.recorridoActivo?.id || this.subiendoFoto) return;
    try {
      const foto = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      if (!foto.base64String) {
        await this.mostrarError('No se pudo obtener la imagen de la cámara');
        return;
      }
      if (!this.ultimaPosicionId) {
        await this.mostrarError('Espera a que se registre al menos una posición GPS antes de tomar una foto');
        return;
      }
      this.subiendoFoto = true;
      const foto_base64 = `data:image/jpeg;base64,${foto.base64String}`;
      this.http.post<any>(`${environment.apiUrl}/reportes`, {
        recorrido_id: this.recorridoActivo.id,
        posicion_id: this.ultimaPosicionId,
        foto_base64
      }).subscribe({
        next: async () => {
          this.subiendoFoto = false;
          const toast = await this.toastController.create({
            message: '📸 Foto de reporte enviada correctamente',
            duration: 3000, color: 'success', position: 'bottom'
          });
          await toast.present();
        },
        error: async (err) => {
          this.subiendoFoto = false;
          const msg = err?.error?.message || err?.message || 'Error de red o servidor al subir foto';
          await this.mostrarError('No se pudo enviar la foto de reporte: ' + msg);
        }
      });
    } catch (err: any) {
      this.subiendoFoto = false;
      let errorMsg = typeof err === 'string' ? err : err?.message || '';
      try { if (!errorMsg) errorMsg = JSON.stringify(err); } catch { errorMsg = 'Error desconocido'; }
      const msgLower = errorMsg.toLowerCase();
      if (msgLower.includes('cancel') || msgLower.includes('no image')) return;
      await this.mostrarError('Error al acceder a la cámara: ' + errorMsg);
    }
  }

  finalizarRecorrido() {
    if (!this.recorridoActivo?.id) return;
    this.procesando = true;
    this.http.post<any>(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/finalizar`, {}).subscribe({
      next: async () => {
        this.procesando = false;
        await this.detenerTrackingYIntervalos();
        const toast = await this.toastController.create({
          message: '¡Recorrido finalizado exitosamente!',
          duration: 3000, color: 'success', position: 'bottom', icon: 'checkmark-done-outline'
        });
        await toast.present();
        this.router.navigate(['/rutas']);
      },
      error: async (err) => {
        this.procesando = false;
        await this.mostrarError(err?.error?.message || 'No se pudo finalizar el recorrido');
      }
    });
  }

  formatearHora(timestamp: string): string {
    if (!timestamp) return 'No registrada';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje, duration: 4000, color: 'danger', position: 'bottom'
    });
    await toast.present();
  }
}