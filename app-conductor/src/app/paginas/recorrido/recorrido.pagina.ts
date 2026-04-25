import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin, Location, CallbackError } from '@capacitor-community/background-geolocation';
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonBackButton,
  ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, arrowBackOutline, closeCircleOutline, locationOutline } from 'ionicons/icons';

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonIcon,
    IonButtons,
    IonBackButton
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/rutas"></ion-back-button>
        </ion-buttons>
        <ion-title>Recorrido Activo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding fondo-oscuro">
      @if (cargando) {
        <div class="contenedor-centrado">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Verificando estado del recorrido...</p>
        </div>
      } @else {
        @if (!recorridoActivo) {
          <div class="contenedor-centrado msg-vacio">
            <ion-icon name="close-circle-outline" color="medium"></ion-icon>
            <h2>No tienes un recorrido activo</h2>
            <ion-button class="ion-margin-top" color="primary" routerLink="/rutas">
              Volver a mis rutas
            </ion-button>
          </div>
        } @else {
          <div class="contenedor-top">
            <ion-card class="tarjeta-recorrido">
              <ion-card-header>
                <ion-card-subtitle>Información actual</ion-card-subtitle>
                <ion-card-title>
                  Ruta: {{ recorridoActivo.ruta_nombre || recorridoActivo.ruta_id }}
                </ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <div class="info-row">
                  <strong>Vehículo Asignado:</strong>
                  <span class="placa-vehiculo">{{ recorridoActivo.placa }} - {{ recorridoActivo.marca }}</span>
                </div>
                <div class="info-row">
                  <strong>Hora de Inicio:</strong>
                  <span>{{ formatearHora(recorridoActivo.timestamp_inicio) }}</span>
                </div>

                <div class="info-row gps-contenedor">
                  <strong>Ubicación Actual:</strong>
                  @if (coordenadas) {
                    <span class="coords-activas">
                      <ion-icon name="location-outline" color="success"></ion-icon>
                      Lat: {{ coordenadas.lat | number:'1.4-4' }}, Lon: {{ coordenadas.lon | number:'1.4-4' }}
                    </span>
                  } @else {
                    <span class="coords-buscando">
                      <ion-spinner name="dots"></ion-spinner> Detectando satélites GPS...
                    </span>
                  }
                </div>

                @if (pendientesSQLite > 0) {
                  <div class="info-row">
                    <strong>Puntos offline pendientes:</strong>
                    <span class="alerta-peligro">⚠️ {{ pendientesSQLite }} posiciones sin sincronizar</span>
                  </div>
                }
              </ion-card-content>
            </ion-card>

            <div class="contenedor-boton">
              <ion-button
                expand="block"
                color="success"
                (click)="finalizarRecorrido()"
                [disabled]="procesando"
                class="boton-finalizar"
              >
                @if (procesando) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  <ion-icon slot="start" name="checkmark-done-outline"></ion-icon>
                  Finalizar recorrido
                }
              </ion-button>
            </div>
          </div>
        }
      }
    </ion-content>
  `,
  styles: [`
    .fondo-oscuro { --background: #121212; color: #e0e0e0; }
    .contenedor-centrado { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; }
    .msg-vacio h2 { color: #a0a0a0; font-size: 1.2rem; font-weight: 500; margin-top: 10px; }
    .msg-vacio ion-icon { font-size: 4rem; margin-bottom: 5px; }
    .contenedor-top { height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 20px; }
    .tarjeta-recorrido { --background: #1e1e1e; --color: #e0e0e0; border-radius: 12px; margin: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
    ion-card-title { font-size: 1.4rem; color: #ffffff; margin-top: 5px; }
    .info-row { margin-bottom: 12px; font-size: 1rem; display: flex; flex-direction: column; gap: 4px; }
    .info-row strong { color: #a0a0a0; font-size: 0.9rem; }
    .placa-vehiculo { color: #4caf50; font-weight: 600; font-size: 1.1rem; }
    .gps-contenedor { margin-top: 10px; padding-top: 10px; border-top: 1px solid #333; }
    .coords-activas { color: #81c784; display: flex; align-items: center; gap: 5px; font-size: 1.05rem; }
    .coords-buscando { color: #ffd54f; display: flex; align-items: center; gap: 5px; }
    .alerta-peligro { color: #ff5252; font-size: 0.9rem; font-weight: 600; }
    .contenedor-boton { margin-top: 30px; }
    .boton-finalizar { --border-radius: 12px; box-shadow: 0 4px 10px rgba(46,125,50,0.4); height: 60px; font-size: 1.2rem; font-weight: bold; }
  `]
})
export class RecorridoPagina implements OnInit, OnDestroy {
  cargando = true;
  procesando = false;
  recorridoActivo: any = null;
  recorridoIdUrl: string | null = null;

  coordenadas: { lat: number; lon: number } | null = null;
  private watcherId: string | null = null;
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
    addIcons({ checkmarkDoneOutline, arrowBackOutline, closeCircleOutline, locationOutline });
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
          // Eliminar de SQLite al sincronizar exitosamente
          await this.db.run(`DELETE FROM posiciones_pendientes WHERE id = ?`, [pos.id]);
          await this.actualizarContadorPendientes();
        } catch {
          // Incrementar contador de intentos y parar el lote
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

    // Solicitar también permisos de background location
    try {
      await BackgroundGeolocation.addWatcher(
        { requestPermissions: true, stale: false },
        () => {}
      ).then(id => BackgroundGeolocation.removeWatcher({ id }));
    } catch {
      console.warn('Background geolocation: no se pudo pre-solicitar permisos');
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
    this.watcherId = await BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: 'EcoRutas está registrando tu recorrido',
        backgroundTitle: 'Recorrido activo',
        requestPermissions: true,
        stale: false,
        distanceFilter: 5
      },
      (location: Location | undefined, error: CallbackError | undefined) => {
        if (error || !location) return;
        const pos = { lat: location.latitude, lon: location.longitude };
        this.coordenadas = pos;
        this.enviarPosicion(pos);
      }
    );
    this.intervaloReintentos = setInterval(() => this.subirPendientesSQLite(), 30000);
  }

  async detenerTrackingYIntervalos() {
    if (this.watcherId) {
      await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
      this.watcherId = null;
    }
    if (this.intervaloReintentos) clearInterval(this.intervaloReintentos);
  }


  enviarPosicion(pos: { lat: number; lon: number }) {
    if (!this.recorridoActivo?.id) return;
    this.http.post(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/posiciones`, pos).subscribe({
      next: () => { },
      error: () => {
        // Red caída: guardar en SQLite en lugar de array en memoria
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