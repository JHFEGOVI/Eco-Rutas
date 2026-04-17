import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, arrowBackOutline, closeCircleOutline, locationOutline, carSportOutline, timeOutline, mapOutline, cloudUploadOutline, wifiOutline, batteryChargingOutline } from 'ionicons/icons';

const DB_NOMBRE = 'ecorrutas_offline';

@Component({
  selector: 'app-recorrido',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    IonContent,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonHeader,
    IonToolbar,
    IonTitle
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-transparente">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/rutas" text="Volver" class="btn-back-custom"></ion-back-button>
        </ion-buttons>
        <ion-title class="header-titulo">Recorrido Activo</ion-title>
        <ion-buttons slot="end">
          <div class="header-status">
            <span class="status-dot"></span>
            <span class="status-text">EN VIVO</span>
          </div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="true" class="fondo-recorrido">
      
      @if (cargando) {
        <div class="centro-carga">
          <ion-spinner name="crescent" class="spinner-verde"></ion-spinner>
          <p class="cargando-txt">Verificando estado del recorrido...</p>
        </div>
      } @else {
        @if (!recorridoActivo) {
          <div class="vacio-recorrido">
            <div class="vacio-ico-recorrido">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <p class="vacio-txt-recorrido">No tienes un recorrido activo</p>
            <p class="vacio-sub-recorrido">Inicia una ruta desde la pantalla principal</p>
            <button class="btn-volver-inicio" routerLink="/rutas">
              <svg viewBox="0 0 24 24">
                <path d="M12 4l-8 8h5v8h6v-8h5z"/>
              </svg>
              Volver a mis rutas
            </button>
          </div>
        } @else {
          <div class="content-recorrido">
            
            <!-- Hero Section -->
            <div class="hero-recorrido">
              <div class="hero-icono">
                <svg viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <div class="hero-info">
                <h1 class="hero-titulo">{{ recorridoActivo.ruta_nombre || 'Ruta ' + recorridoActivo.ruta_id }}</h1>
                <p class="hero-subtitulo">{{ recorridoActivo.placa }} · {{ recorridoActivo.marca }}</p>
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid-recorrido">
              <div class="stat-card-recorrido">
                <div class="stat-ico-recorrido hora">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <div>
                  <span class="stat-val-recorrido">{{ formatearHora(recorridoActivo.timestamp_inicio) }}</span>
                  <span class="stat-lbl-recorrido">Hora de inicio</span>
                </div>
              </div>
              <div class="stat-card-recorrido">
                <div class="stat-ico-recorrido gps" [class.gps-activo]="coordenadas">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                </div>
                <div>
                  <span class="stat-val-recorrido">{{ coordenadas ? 'Activo' : 'Buscando...' }}</span>
                  <span class="stat-lbl-recorrido">Estado GPS</span>
                </div>
              </div>
            </div>

            <!-- Ubicación Actual -->
            <div class="ubicacion-card">
              <div class="ubicacion-header">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                <span>Ubicación actual</span>
              </div>
              <div class="ubicacion-contenido">
                @if (coordenadas) {
                  <div class="coordenadas">
                    <div class="coord-item">
                      <span class="coord-lbl">Latitud</span>
                      <span class="coord-val">{{ coordenadas.lat | number:'1.6-6' }}</span>
                    </div>
                    <div class="coord-item">
                      <span class="coord-lbl">Longitud</span>
                      <span class="coord-val">{{ coordenadas.lon | number:'1.6-6' }}</span>
                    </div>
                  </div>
                } @else {
                  <div class="gps-buscando">
                    <ion-spinner name="crescent" class="spinner-pequeno"></ion-spinner>
                    <span>Detectando satélites GPS...</span>
                  </div>
                }
              </div>
            </div>

            <!-- Offline Pendientes -->
            @if (pendientesSQLite > 0) {
              <div class="alerta-offline">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <div>
                  <span class="alerta-titulo">{{ pendientesSQLite }} posiciones pendientes</span>
                  <span class="alerta-sub">Se sincronizarán automáticamente</span>
                </div>
              </div>
            }

            <!-- Botón Finalizar -->
            <button 
              class="btn-finalizar"
              (click)="finalizarRecorrido()"
              [disabled]="procesando"
            >
              @if (procesando) {
                <ion-spinner name="crescent" class="btn-spinner-blanco"></ion-spinner>
                <span>Finalizando...</span>
              } @else {
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Finalizar recorrido</span>
              }
            </button>

            <!-- Footer Info -->
            <div class="footer-recorrido">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              <span>Actualización automática cada 10 segundos</span>
            </div>

          </div>
        }
      }
    </ion-content>
  `,
  styles: [`
    .fondo-recorrido {
      --background: #f0f4f0;
    }

    /* Header Transparente */
    .header-transparente {
      --background: transparent;
      --border-style: none;
      padding-top: 8px;
    }
    .header-titulo {
      font-size: 0.9rem;
      font-weight: 800;
      color: #1e8c34;
      text-align: center;
    }
    .header-status {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(30,140,52,0.1);
      padding: 4px 10px;
      border-radius: 20px;
      margin-right: 8px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #1e8c34;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    .status-text {
      font-size: 0.6rem;
      font-weight: 800;
      color: #1e8c34;
      letter-spacing: 0.5px;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    /* Carga */
    .centro-carga {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
    }
    .spinner-verde {
      --color: #1e8c34;
    }
    .cargando-txt {
      font-size: 0.85rem;
      color: #9e9e9e;
    }

    /* Vacío */
    .vacio-recorrido {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 2rem;
      text-align: center;
    }
    .vacio-ico-recorrido {
      width: 80px;
      height: 80px;
      background: #e8f5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .vacio-ico-recorrido svg {
      width: 40px;
      height: 40px;
      fill: #1e8c34;
    }
    .vacio-txt-recorrido {
      font-size: 1.1rem;
      font-weight: 700;
      color: #333;
      margin: 0 0 8px;
    }
    .vacio-sub-recorrido {
      font-size: 0.8rem;
      color: #9e9e9e;
      margin: 0 0 24px;
    }
    .btn-volver-inicio {
      background: #1e8c34;
      color: #fff;
      border: none;
      border-radius: 30px;
      padding: 12px 24px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .btn-volver-inicio svg {
      width: 18px;
      height: 18px;
      fill: #fff;
    }

    /* Content */
    .content-recorrido {
      padding: 20px 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Hero Section */
    .hero-recorrido {
      background: linear-gradient(135deg, #1e8c34 0%, #156b27 100%);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .hero-icono {
      width: 56px;
      height: 56px;
      background: rgba(255,255,255,0.2);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-icono svg {
      width: 32px;
      height: 32px;
      fill: #fff;
    }
    .hero-info {
      flex: 1;
    }
    .hero-titulo {
      margin: 0 0 4px;
      font-size: 1.1rem;
      font-weight: 800;
      color: #fff;
    }
    .hero-subtitulo {
      margin: 0;
      font-size: 0.7rem;
      color: rgba(255,255,255,0.8);
    }

    /* Stats Grid */
    .stats-grid-recorrido {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .stat-card-recorrido {
      background: #fff;
      border-radius: 16px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      border: 1px solid #eef2ee;
    }
    .stat-ico-recorrido {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-ico-recorrido svg {
      width: 22px;
      height: 22px;
    }
    .stat-ico-recorrido.hora {
      background: #e3f2fd;
    }
    .stat-ico-recorrido.hora svg {
      fill: #1565c0;
    }
    .stat-ico-recorrido.gps {
      background: #fff3e0;
    }
    .stat-ico-recorrido.gps svg {
      fill: #e65100;
    }
    .stat-ico-recorrido.gps.gps-activo {
      background: #e8f5e9;
    }
    .stat-ico-recorrido.gps.gps-activo svg {
      fill: #1e8c34;
    }
    .stat-val-recorrido {
      display: block;
      font-size: 1rem;
      font-weight: 900;
      color: #1a2e1a;
      line-height: 1.2;
    }
    .stat-lbl-recorrido {
      font-size: 0.6rem;
      color: #9e9e9e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Ubicación Card */
    .ubicacion-card {
      background: #fff;
      border-radius: 18px;
      border: 1px solid #eef2ee;
      overflow: hidden;
    }
    .ubicacion-header {
      background: #f8faf8;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #eef2ee;
    }
    .ubicacion-header svg {
      width: 18px;
      height: 18px;
      fill: #1e8c34;
    }
    .ubicacion-header span {
      font-size: 0.75rem;
      font-weight: 700;
      color: #1a2e1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ubicacion-contenido {
      padding: 16px;
    }
    .coordenadas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .coord-item {
      background: #f8faf8;
      border-radius: 12px;
      padding: 10px;
      text-align: center;
    }
    .coord-lbl {
      display: block;
      font-size: 0.6rem;
      color: #9e9e9e;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .coord-val {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #1a2e1a;
      font-family: monospace;
    }
    .gps-buscando {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px;
      color: #e65100;
      font-size: 0.8rem;
    }
    .spinner-pequeno {
      --color: #e65100;
      width: 18px;
      height: 18px;
    }

    /* Alerta Offline */
    .alerta-offline {
      background: #fff3e0;
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 4px solid #e65100;
    }
    .alerta-offline svg {
      width: 24px;
      height: 24px;
      fill: #e65100;
    }
    .alerta-titulo {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: #e65100;
    }
    .alerta-sub {
      display: block;
      font-size: 0.65rem;
      color: #9e9e9e;
    }

    /* Botón Finalizar */
    .btn-finalizar {
      width: 100%;
      height: 52px;
      background: #1e8c34;
      color: #fff;
      border: none;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      margin-top: 8px;
      box-shadow: 0 4px 14px rgba(30,140,52,0.3);
      transition: all 0.2s ease;
    }
    .btn-finalizar:active {
      transform: scale(0.98);
    }
    .btn-finalizar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-finalizar svg {
      width: 20px;
      height: 20px;
      fill: #fff;
    }
    .btn-spinner-blanco {
      --color: #fff;
      width: 18px;
      height: 18px;
    }

    /* Footer */
    .footer-recorrido {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding-top: 16px;
      font-size: 0.6rem;
      color: #bdbdbd;
    }
    .footer-recorrido svg {
      width: 12px;
      height: 12px;
      fill: #bdbdbd;
    }
  `]
})
export class RecorridoPagina implements OnInit, OnDestroy {
  cargando = true;
  procesando = false;
  recorridoActivo: any = null;
  recorridoIdUrl: string | null = null;

  coordenadas: { lat: number; lon: number } | null = null;
  intervaloGps: any;
  intervaloReintentos: any;
  pendientesSQLite = 0;

  // Conexión SQLite
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ checkmarkDoneOutline, arrowBackOutline, closeCircleOutline, locationOutline, carSportOutline, timeOutline, mapOutline, cloudUploadOutline, wifiOutline, batteryChargingOutline });
  }

  async ngOnInit() {
    this.recorridoIdUrl = this.activatedRoute.snapshot.paramMap.get('id');
    await this.iniciarSQLite();
    await this.solicitarPermisosGps();
    this.cargarRecorridoActivo();
  }

  ngOnDestroy() {
    this.detenerIntervalos();
    this.cerrarSQLite();
  }

  // ─── SQLite ──────────────────────────────────────────────────────────────

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
              lat: pos.lat,
              lon: pos.lon
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

  iniciarTrackingGps() {
    this.tomarPosicion();
    this.intervaloGps = setInterval(() => this.tomarPosicion(), 10000);
    this.intervaloReintentos = setInterval(() => this.subirPendientesSQLite(), 15000);
  }

  detenerIntervalos() {
    if (this.intervaloGps) clearInterval(this.intervaloGps);
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
    this.http.post(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/posiciones`, pos).subscribe({
      next: () => {},
      error: () => {
        this.guardarPosicionOffline(pos.lat, pos.lon);
      }
    });
  }

  finalizarRecorrido() {
    if (!this.recorridoActivo?.id) return;
    this.procesando = true;
    this.http.post<any>(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/finalizar`, {}).subscribe({
      next: async () => {
        this.procesando = false;
        this.detenerIntervalos();
        const toast = await this.toastController.create({
          message: '¡Recorrido finalizado exitosamente!',
          duration: 3000, color: 'success', position: 'bottom'
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