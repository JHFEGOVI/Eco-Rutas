import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recorrido',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    IonContent,
    IonSpinner,
  ],
  template: `
    <ion-content [scrollY]="true" class="fondo-oscuro">

      <!-- TOOLBAR MANUAL -->
      <div class="toolbar">
        <button class="toolbar-back" (click)="volverARutas()">
          <svg viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Volver
        </button>
        @if (recorridoActivo) {
          <div class="toolbar-status">
            <span class="status-dot"></span>
            EN CURSO
          </div>
        }
      </div>

      <!-- CARGANDO -->
      @if (cargando) {
        <div class="centro">
          <ion-spinner name="crescent" class="spinner-verde"></ion-spinner>
          <p class="centro-txt">Verificando recorrido...</p>
        </div>
      }

      <!-- SIN RECORRIDO -->
      @if (!cargando && !recorridoActivo) {
        <div class="vacio">
          <div class="vacio-ico">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p class="vacio-titulo">Sin recorrido activo</p>
          <p class="vacio-sub">No tienes un recorrido en curso actualmente</p>
          <button class="btn-volver" (click)="volverARutas()">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Volver a mis rutas
          </button>
        </div>
      }

      <!-- RECORRIDO ACTIVO -->
      @if (!cargando && recorridoActivo) {

        <!-- HERO -->
        <div class="hero">
          <p class="hero-sub">Recorrido activo</p>
          <h1 class="hero-ruta">{{ recorridoActivo.ruta_nombre || 'Ruta asignada' }}</h1>
          <div class="hero-inicio">
            <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
            Iniciado a las {{ formatearHora(recorridoActivo.timestamp_inicio) }}
          </div>
        </div>

        <div class="content">

          <!-- VEHÍCULO -->
          <div class="info-card">
            <div class="info-card-titulo">
              <svg viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>
              Vehículo asignado
            </div>
            <div class="info-fila">
              <span class="info-key">Placa</span>
              <span class="info-val placa">{{ recorridoActivo.placa || '—' }}</span>
            </div>
            <div class="info-fila">
              <span class="info-key">Marca</span>
              <span class="info-val">{{ recorridoActivo.marca || '—' }}</span>
            </div>
          </div>

          <!-- GPS -->
          <div class="gps-card">
            <div class="gps-ico-wrap">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
            </div>
            <div class="gps-info">
              <span class="gps-titulo">Ubicación GPS actual</span>
              @if (coordenadas) {
                <span class="gps-coords">
                  {{ coordenadas.lat | number:'1.4-4' }}° N,
                  {{ coordenadas.lon | number:'1.4-4' }}° W
                </span>
              } @else {
                <span class="gps-buscando">
                  <ion-spinner name="dots" class="spinner-mini"></ion-spinner>
                  Detectando señal GPS...
                </span>
              }
            </div>
            <div class="gps-estado" [class.gps-estado--activo]="!!coordenadas">
              {{ coordenadas ? 'Activo' : 'Buscando' }}
            </div>
          </div>

          <!-- COLA OFFLINE -->
          @if (colaPosiciones.length > 0) {
            <div class="alerta-offline">
              <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              {{ colaPosiciones.length }} posiciones pendientes de sincronizar
            </div>
          }

          <!-- BOTÓN FINALIZAR -->
          <button
            class="btn-finalizar"
            [disabled]="procesando"
            (click)="finalizarRecorrido()"
          >
            @if (procesando) {
              <ion-spinner name="crescent" class="btn-spinner"></ion-spinner>
              Finalizando...
            } @else {
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Finalizar recorrido
            }
          </button>

        </div>
      }

    </ion-content>
  `,
  styles: [`
    .fondo-oscuro { --background: #0f1f0f; }

    /* ── Toolbar ── */
    .toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 52px 16px 12px;
      background: #145a24;
    }
    .toolbar-back {
      display: flex; align-items: center; gap: 6px;
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.9); font-size: 0.82rem; font-weight: 600;
      font-family: inherit;
    }
    .toolbar-back svg { width: 18px; height: 18px; fill: rgba(255,255,255,0.9); }
    .toolbar-status {
      display: flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.15);
      padding: 4px 10px; border-radius: 20px;
      font-size: 0.62rem; font-weight: 700; color: #fff;
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #69f0ae;
      animation: blink 1.5s ease-in-out infinite;
    }
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

    /* ── Hero ── */
    .hero {
      background: #145a24;
      padding: 8px 16px 28px;
      position: relative; overflow: hidden;
    }
    .hero::after {
      content: ''; position: absolute;
      bottom: -20px; left: 0; right: 0; height: 40px;
      background: #0f1f0f;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }
    .hero-sub {
      font-size: 0.62rem; color: rgba(255,255,255,0.65);
      text-transform: uppercase; letter-spacing: 1.5px;
      margin: 0 0 3px; position: relative; z-index: 1;
    }
    .hero-ruta {
      font-size: 1.3rem; font-weight: 900; color: #fff;
      margin: 0 0 6px; position: relative; z-index: 1;
    }
    .hero-inicio {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.68rem; color: rgba(255,255,255,0.7);
      position: relative; z-index: 1;
    }
    .hero-inicio svg { width: 12px; height: 12px; fill: rgba(255,255,255,0.7); }

    /* ── Content ── */
    .content { padding: 24px 14px 24px; display: flex; flex-direction: column; gap: 12px; }

    /* ── Centro / Vacío ── */
    .centro { display: flex; flex-direction: column; align-items: center; padding: 4rem 1rem; gap: 12px; }
    .spinner-verde { --color: #4caf50; }
    .centro-txt { font-size: 0.82rem; color: #4a6a4a; }
    .vacio { display: flex; flex-direction: column; align-items: center; padding: 4rem 1.5rem; gap: 10px; }
    .vacio-ico { width: 64px; height: 64px; background: #1a2e1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .vacio-ico svg { width: 30px; height: 30px; fill: #4caf50; }
    .vacio-titulo { font-size: 1rem; font-weight: 900; color: #e0e0e0; text-align: center; }
    .vacio-sub { font-size: 0.78rem; color: #4a6a4a; text-align: center; }

    /* ── Info card ── */
    .info-card {
      background: #1a2e1a; border-radius: 14px;
      padding: 14px; border: 1px solid #2d4d2d;
    }
    .info-card-titulo {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.65rem; font-weight: 700; color: #81c784;
      text-transform: uppercase; letter-spacing: 0.8px;
      margin-bottom: 10px;
    }
    .info-card-titulo svg { width: 14px; height: 14px; fill: #81c784; }
    .info-fila {
      display: flex; align-items: center; justify-content: space-between;
      padding: 7px 0; border-bottom: 1px solid #2d4d2d;
    }
    .info-fila:last-child { border-bottom: none; padding-bottom: 0; }
    .info-key { font-size: 0.72rem; color: #81c784; }
    .info-val { font-size: 0.78rem; font-weight: 700; color: #e0e0e0; }
    .info-val.placa { color: #4caf50; font-family: monospace; font-size: 0.9rem; }

    /* ── GPS card ── */
    .gps-card {
      background: #1a2e1a; border-radius: 14px;
      padding: 12px 14px; border: 1px solid #2d4d2d;
      display: flex; align-items: center; gap: 12px;
    }
    .gps-ico-wrap {
      width: 40px; height: 40px; background: #1e8c34;
      border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .gps-ico-wrap svg { width: 20px; height: 20px; fill: #fff; }
    .gps-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .gps-titulo { font-size: 0.65rem; color: #81c784; font-weight: 700; }
    .gps-coords { font-size: 0.78rem; font-weight: 700; color: #e0e0e0; }
    .gps-buscando { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: #ffd54f; }
    .spinner-mini { --color: #ffd54f; width: 14px; height: 14px; }
    .gps-estado {
      font-size: 0.62rem; font-weight: 700; padding: 3px 8px;
      border-radius: 20px; background: #f5f5f5; color: #9e9e9e; flex-shrink: 0;
    }
    .gps-estado--activo { background: #e8f5e9; color: #1e8c34; }

    /* ── Alerta offline ── */
    .alerta-offline {
      display: flex; align-items: center; gap: 8px;
      background: rgba(198,40,40,0.15); border: 1px solid rgba(198,40,40,0.3);
      border-radius: 10px; padding: 10px 14px;
      font-size: 0.75rem; color: #ef9a9a; font-weight: 600;
    }
    .alerta-offline svg { width: 16px; height: 16px; fill: #ef9a9a; flex-shrink: 0; }

    /* ── Botones ── */
    .btn-volver {
      display: flex; align-items: center; gap: 6px;
      padding: 0.6rem 1.25rem;
      background: #1a2e1a; color: #81c784;
      border: 1.5px solid #2d4d2d; border-radius: 10px;
      font-size: 0.82rem; font-weight: 700;
      cursor: pointer; font-family: inherit; margin-top: 8px;
    }
    .btn-volver svg { width: 16px; height: 16px; fill: #81c784; }

    .btn-finalizar {
      width: 100%; height: 56px;
      background: #c62828; color: #fff; border: none;
      border-radius: 14px; font-size: 1rem; font-weight: 900;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; font-family: inherit;
      box-shadow: 0 4px 16px rgba(198,40,40,0.4);
      margin-top: 8px;
    }
    .btn-finalizar:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-finalizar svg { width: 22px; height: 22px; fill: #fff; }
    .btn-spinner { --color: #fff; width: 20px; height: 20px; }
  `],
})
export class RecorridoPagina implements OnInit, OnDestroy {
  cargando = true;
  procesando = false;
  recorridoActivo: any = null;
  coordenadas: { lat: number; lon: number } | null = null;
  colaPosiciones: { lat: number; lon: number }[] = [];

  private intervaloGps: any;
  private intervaloReintentos: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
  ) {}

  async ngOnInit() {
    await this.solicitarPermisosGps();
    this.cargarRecorridoActivo();
  }

  ngOnDestroy() {
    this.detenerIntervalos();
  }

  async solicitarPermisosGps() {
    try {
      const permisos = await Geolocation.requestPermissions();
      if (permisos.location !== 'granted') {
        await this.mostrarToast('Atención: Sin permisos GPS. La ruta no transmitirá ubicación.', 'warning');
      }
    } catch (e) {
      console.warn('GPS no soportado en este entorno');
    }
  }

  cargarRecorridoActivo() {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/recorridos/activo`).subscribe({
      next: (res) => {
        this.recorridoActivo = res.data || null;
        this.cargando = false;
        if (this.recorridoActivo?.id) {
          this.iniciarTrackingGps();
        }
      },
      error: async (err) => {
        this.cargando = false;
        await this.mostrarToast(err?.error?.message || 'Error al obtener el recorrido', 'danger');
      },
    });
  }

  iniciarTrackingGps() {
    this.tomarPosicion();
    this.intervaloGps = setInterval(() => this.tomarPosicion(), 10000);
    this.intervaloReintentos = setInterval(() => this.subirColaPendiente(), 30000);
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
    } catch (e) {
      console.error('Error GPS:', e);
    }
  }

  enviarPosicion(pos: { lat: number; lon: number }) {
    if (!this.recorridoActivo?.id) return;
    this.http.post(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/posiciones`, pos).subscribe({
      next: () => {},
      error: () => { this.colaPosiciones.push(pos); },
    });
  }

  async subirColaPendiente() {
    if (this.colaPosiciones.length === 0 || !this.recorridoActivo?.id) return;
    const lote = [...this.colaPosiciones];
    for (const pos of lote) {
      try {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/posiciones`, pos)
        );
        this.colaPosiciones = this.colaPosiciones.filter(p => p !== pos);
      } catch {
        break;
      }
    }
  }

  finalizarRecorrido() {
    if (!this.recorridoActivo?.id || this.procesando) return;
    this.procesando = true;
    this.http.post<any>(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/finalizar`, {}).subscribe({
      next: async () => {
        this.procesando = false;
        this.detenerIntervalos();
        await this.mostrarToast('¡Recorrido finalizado exitosamente!', 'success');
        this.router.navigate(['/rutas']);
      },
      error: async (err) => {
        this.procesando = false;
        await this.mostrarToast(err?.error?.message || 'No se pudo finalizar el recorrido', 'danger');
      },
    });
  }

  volverARutas() {
    this.router.navigate(['/rutas']);
  }

  formatearHora(timestamp: string): string {
    if (!timestamp) return 'No registrada';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return timestamp; }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje, duration: 4000, color, position: 'bottom',
    });
    await toast.present();
  }
}