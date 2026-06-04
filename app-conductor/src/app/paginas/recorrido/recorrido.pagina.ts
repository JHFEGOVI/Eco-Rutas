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
  IonButtons,
  IonBackButton,
  ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, arrowBackOutline } from 'ionicons/icons';

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
    <ion-header class="ion-no-border">
      <ion-toolbar class="toolbar-verde">
        <ion-buttons slot="start">
          <ion-back-button class="back-custom" defaultHref="/rutas"></ion-back-button>
        </ion-buttons>
        <ion-title class="toolbar-title">Recorrido activo</ion-title>
        <div slot="end" class="live-pill">
          <span class="live-dot"></span>
          <span class="live-txt">EN VIVO</span>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="true" class="fondo">

      @if (cargando) {
        <div class="estado-centrado">
          <ion-spinner name="crescent" class="spinner-verde"></ion-spinner>
          <p class="estado-txt">Verificando recorrido...</p>
        </div>

      } @else if (!recorridoActivo) {
        <div class="estado-centrado">
          <div class="vacio-ico">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
          </div>
          <p class="vacio-titulo">Sin recorrido activo</p>
          <p class="vacio-sub">No tienes ningún recorrido en curso ahora mismo</p>
          <button class="btn-volver" (click)="irARutas()">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Volver a mis rutas
          </button>
        </div>

      } @else {
        <div class="body">

          <!-- ── RUTA CARD ── -->
          <div class="rcard">
            <div class="rtop">
              <div class="rico-wrap">
                <div class="rico">
                  <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                </div>
                <div class="rinfo">
                  <p class="rnombre">{{ recorridoActivo.ruta_id }}</p>
                  <p class="rfecha">{{ fechaHoy() }}</p>
                </div>
              </div>
              <span class="chip"><span class="cdot"></span>En curso</span>
            </div>
          </div>

          <!-- ── INFO CARD ── -->
          <div class="info-card">
            <div class="irow">
              <div class="iico ig">
                <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
              </div>
              <div class="itxt">
                <span class="ilbl">Vehículo</span>
                <span class="ival g">{{ recorridoActivo.placa }} · {{ recorridoActivo.marca }}</span>
              </div>
            </div>

            <div class="irow">
              <div class="iico ib">
                <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
              </div>
              <div class="itxt">
                <span class="ilbl">Hora de inicio</span>
                <span class="ival">{{ formatearHora(recorridoActivo.timestamp_inicio) }}</span>
              </div>
            </div>

            <div class="irow sin-borde">
              <div class="iico ig">
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
              </div>
              <div class="itxt">
                <span class="ilbl">GPS activo</span>
                @if (coordenadas) {
                  <div class="gps-inline">
                    <span class="gdot"></span>
                    <span class="gcoords">
                      {{ coordenadas.lat | number:'1.4-4' }} · {{ coordenadas.lon | number:'1.4-4' }}
                    </span>
                  </div>
                } @else {
                  <div class="gps-buscando">
                    <ion-spinner name="dots" class="spinner-gps"></ion-spinner>
                    <span>Detectando GPS...</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- ── ALERTA OFFLINE ── -->
          @if (pendientesSQLite > 0) {
            <div class="alerta-offline">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {{ pendientesSQLite }} posición{{ pendientesSQLite !== 1 ? 'es' : '' }} sin sincronizar
            </div>
          }

          <!-- ── REPORTAR INCIDENCIA ── -->
          <div class="rep-card" (click)="!subiendoFoto && tomarFotoReporte()">
            <div class="rep-ico">
              @if (subiendoFoto) {
                <ion-spinner name="crescent" class="spinner-rep"></ion-spinner>
              } @else {
                <svg viewBox="0 0 24 24"><path d="M12 15.2c-1.77 0-3.2-1.43-3.2-3.2S10.23 8.8 12 8.8s3.2 1.43 3.2 3.2-1.43 3.2-3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
              }
            </div>
            <div class="rep-texto">
              <strong>Reportar incidencia</strong>
              <span>Toca para tomar foto del punto actual</span>
            </div>
            <svg class="rep-arr" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </div>

          <!-- ── FINALIZAR ── -->
          <button class="btn-fin" (click)="finalizarRecorrido()" [disabled]="procesando">
            @if (procesando) {
              <ion-spinner name="crescent" class="spinner-btn"></ion-spinner>
              Finalizando...
            } @else {
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Finalizar recorrido
            }
          </button>

          <div class="badge-seguro">
            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Conexión cifrada · EcoRutas v1.0
          </div>

        </div>
      }

    </ion-content>
  `,
  styles: [`

    /* ── Fondo ── */
    .fondo { --background: #f0f4f0; }

    /* ── Toolbar ── */
    ion-toolbar.toolbar-verde {
      --background: #1e8c34;
      --color: #fff;
      --border-width: 0;
      --padding-top: env(safe-area-inset-top);
    }
    .toolbar-title {
      color: #fff;
      font-size: 1rem;
      font-weight: 900;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .back-custom { --color: #fff; }

    /* Pill EN VIVO */
    .live-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(255,255,255,0.18);
      border-radius: 20px;
      padding: 5px 11px;
      margin-right: 12px;
    }
    .live-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #7deb9a;
      animation: blink 1.1s infinite;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.15} }
    .live-txt {
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .4px;
    }

    /* ── Body: ocupa todo el alto disponible ── */
    .body {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px 14px;
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
      min-height: 100%;
    }

    /* ── Estado vacío / cargando ── */
    .estado-centrado {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      padding: 24px;
      text-align: center;
      gap: 12px;
    }
    .spinner-verde { --color: #1e8c34; }
    .estado-txt { font-size: 0.85rem; color: #9e9e9e; }
    .vacio-ico {
      width: 68px; height: 68px;
      background: #e8f5e9;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .vacio-ico svg { width: 32px; height: 32px; fill: #1e8c34; }
    .vacio-titulo { font-size: 1rem; font-weight: 800; color: #333; }
    .vacio-sub { font-size: 0.78rem; color: #9e9e9e; }
    .btn-volver {
      display: flex; align-items: center; gap: 6px;
      background: #1e8c34; color: #fff;
      border: none; border-radius: 12px;
      padding: 12px 20px; font-size: 0.85rem; font-weight: 800;
      font-family: inherit; cursor: pointer;
      margin-top: 8px;
    }
    .btn-volver svg { fill: #fff; width: 16px; height: 16px; }

    /* ── Ruta card ── */
    .rcard {
      background: #fff;
      border-radius: 16px;
      padding: 13px 14px;
      border: 1px solid #eee;
    }
    .rtop {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .rico-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }
    .rico {
      width: 38px; height: 38px;
      background: #e8f5e9;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .rico svg { fill: #1e8c34; width: 18px; height: 18px; }
    .rinfo { flex: 1; min-width: 0; }
    .rnombre {
      font-size: 11px;
      font-weight: 800;
      color: #1e8c34;
      font-family: monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 0 2px;
    }
    .rfecha { font-size: 0.65rem; color: #aaa; margin: 0; font-weight: 500; }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #e8f5e9;
      color: #1b5e20;
      border: 1px solid #c8e6c9;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 9px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .cdot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #2e7d32;
      animation: blink 1s infinite;
    }

    /* ── Info card ── */
    .info-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #eee;
      overflow: hidden;
    }
    .irow {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid #f2f2f2;
    }
    .irow.sin-borde { border-bottom: none; }
    .iico {
      width: 38px; height: 38px;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .ig { background: #e8f5e9; } .ig svg { fill: #1e8c34; }
    .ib { background: #e3f2fd; } .ib svg { fill: #1565c0; }
    .iico svg { width: 18px; height: 18px; }
    .itxt { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
    .ilbl {
      font-size: 9px;
      font-weight: 700;
      color: #bbb;
      text-transform: uppercase;
      letter-spacing: .8px;
    }
    .ival {
      font-size: 0.85rem;
      font-weight: 700;
      color: #111;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ival.g { color: #1e8c34; }

    /* GPS */
    .gps-inline { display: flex; align-items: center; gap: 6px; }
    .gdot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #43a047;
      animation: blink 1s infinite;
      flex-shrink: 0;
    }
    .gcoords { font-size: 0.8rem; font-weight: 700; color: #2e7d32; }
    .gps-buscando {
      display: flex; align-items: center; gap: 6px;
      color: #f57c00; font-size: 0.78rem;
    }
    .spinner-gps { --color: #f57c00; width: 14px; height: 14px; }

    /* ── Alerta offline ── */
    .alerta-offline {
      background: #fff3e0;
      border: 1px solid #ffcc80;
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 0.75rem;
      color: #e65100;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alerta-offline svg { fill: #e65100; width: 16px; height: 16px; flex-shrink: 0; }

    /* ── Reporte ── */
    .rep-card {
      background: #fff;
      border-radius: 16px;
      border: 1.5px solid #ffe082;
      padding: 14px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: transform .1s;
      -webkit-tap-highlight-color: transparent;
    }
    .rep-card:active { transform: scale(.98); }
    .rep-ico {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: #ff8f00;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .rep-ico svg { fill: #fff; width: 22px; height: 22px; }
    .spinner-rep { --color: #fff; width: 22px; height: 22px; }
    .rep-texto { flex: 1; min-width: 0; }
    .rep-texto strong {
      display: block;
      font-size: 0.85rem;
      font-weight: 800;
      color: #4e342e;
    }
    .rep-texto span { font-size: 0.7rem; color: #a1887f; }
    .rep-arr { fill: #ddd; width: 16px; height: 16px; flex-shrink: 0; }

    /* ── Botón finalizar ── */
    .btn-fin {
      width: 100%;
      height: 52px;
      background: #1e8c34;
      color: #fff;
      border: none;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 900;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(30,140,52,.30);
      transition: all .15s;
      -webkit-tap-highlight-color: transparent;
      margin-top: auto;
    }
    .btn-fin:active:not(:disabled) { transform: scale(.98); background: #166628; }
    .btn-fin:disabled { opacity: .5; cursor: not-allowed; }
    .btn-fin svg { fill: #fff; width: 18px; height: 18px; }
    .spinner-btn { --color: #fff; width: 18px; height: 18px; }

    /* ── Badge seguro ── */
    .badge-seguro {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 9px;
      color: #ccc;
      font-weight: 600;
      padding: 4px 0 2px;
    }
    .badge-seguro svg { fill: #ccc; width: 10px; height: 10px; }

    /* ── Responsive — pantallas grandes (tablet) ── */
    @media (min-width: 500px) {
      .body {
        max-width: 480px;
        margin: 0 auto;
        padding-left: 20px;
        padding-right: 20px;
      }
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
    addIcons({ checkmarkDoneOutline, arrowBackOutline });
  }

  async ngOnInit() {
    this.recorridoIdUrl = this.activatedRoute.snapshot.paramMap.get('id');
    await this.iniciarSQLite();
    await this.solicitarPermisosGps();
    this.cargarRecorridoActivo();
  }

  ngOnDestroy() {
    this.detenerTrackingYIntervalos().then(() => this.cerrarSQLite());
  }

  fechaHoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  irARutas(): void {
    this.router.navigate(['/rutas']);
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
      await this.db.run(`DELETE FROM posiciones_pendientes WHERE intentos >= 5`);
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

  // ─── GPS ─────────────────────────────────────────────────────────────────

  async solicitarPermisosGps() {
    try {
      const permisos = await Geolocation.requestPermissions();
      if (permisos.location !== 'granted') {
        await this.mostrarError('Sin permisos de GPS. La ruta no transmitirá la ubicación.');
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
          await this.mostrarError('No se pudo enviar la foto: ' + (err?.error?.message || 'Error de red'));
        }
      });
    } catch (err: any) {
      this.subiendoFoto = false;
      const msg = typeof err === 'string' ? err : err?.message || '';
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('no image')) return;
      await this.mostrarError('Error al acceder a la cámara: ' + msg);
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
        await this.detenerTrackingYIntervalos();
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