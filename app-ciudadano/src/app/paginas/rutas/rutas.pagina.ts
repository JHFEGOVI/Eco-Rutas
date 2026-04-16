import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonSpinner,
  ToastController,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rutas-ciudadano',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ],
  template: `
    <ion-content [scrollY]="true" class="fondo-ciudadano">

      <!-- HERO SECTION -->
      <div class="hero-ciudadano">
        <div class="hero-top">
          <div class="hero-marca-wrap">
            <div class="hero-logo">
              <img src="assets/icon/logo.png" alt="Logo" class="hero-logo-img" />
            </div>
            <span class="hero-marca">EcoRutas</span>
          </div>
          <div class="hero-badge">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span>Ciudadano</span>
          </div>
        </div>
        <h1 class="hero-titulo">Camiones en ruta</h1>
        <p class="hero-subtitulo">CAMIÓN EN TIEMPO REAL </p>
        <div class="hero-fecha">
          <svg viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
          </svg>
          {{ fechaActual }}
        </div>
      </div>

      <div class="content">

        <!-- STATS RESUMEN -->
        <div class="stats-row">
          <div class="stat-card-resumen">
            <div class="stat-ico-resumen verde">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            </div>
            <div>
              <span class="stat-num-resumen">{{ recorridos.length }}</span>
              <span class="stat-lbl-resumen">Camiones activos</span>
            </div>
          </div>
          <div class="stat-card-resumen">
            <div class="stat-ico-resumen naranja">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div>
              <span class="stat-num-resumen">{{ rutasUnicas }}</span>
              <span class="stat-lbl-resumen">Rutas activas</span>
            </div>
          </div>
        </div>

        <!-- REFRESH INDICATOR -->
        <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <!-- CARGANDO -->
        @if (cargandoPrimera) {
          <div class="centro-carga">
            <ion-spinner name="crescent" class="spinner-verde"></ion-spinner>
            <p class="cargando-txt">Buscando camiones activos...</p>
          </div>
        }

        <!-- SIN RUTAS -->
        @if (!cargandoPrimera && recorridos.length === 0) {
          <div class="vacio-ciudadano">
            <div class="vacio-ico-ciudadano">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
            </div>
            <p class="vacio-txt-ciudadano">No hay camiones en ruta</p>
            <p class="vacio-sub-ciudadano">En este momento no hay recorridos activos</p>
          </div>
        }

        <!-- LISTA DE RECORRIDOS -->
        @if (!cargandoPrimera && recorridos.length > 0) {
          <div class="sec-header">
            <span class="sec-titulo">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              EN VIVO
            </span>
            <span class="sec-refresco">Actualiza cada 30s</span>
          </div>

          @for (recorrido of recorridos; track recorrido.id) {
            <div class="camion-card" (click)="irAlMapa(recorrido.id)">
              <div class="camion-header">
                <div class="camion-icono">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <div class="camion-info">
                  <h3 class="camion-ruta">{{ recorrido.ruta_nombre || 'Ruta ' + recorrido.ruta_id }}</h3>
                  <div class="camion-detalles">
                    <span class="detalle">
                      <svg viewBox="0 0 24 24" width="12" height="12">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      </svg>
                      {{ recorrido.vehiculo_placa || 'Sin placa' }}
                    </span>
                    <span class="detalle">
                      <svg viewBox="0 0 24 24" width="12" height="12">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      Inició: {{ formatearHora(recorrido.timestamp_inicio) }}
                    </span>
                  </div>
                </div>
                <div class="estado-badge">
                  <span class="punto-vivo"></span>
                  EN RUTA
                </div>
              </div>
              <div class="camion-footer">
                <span class="ver-mapa">
                  Ver en mapa
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </span>
              </div>
            </div>
          }
        }

        <!-- ÚLTIMA ACTUALIZACIÓN -->
        @if (!cargandoPrimera && recorridos.length > 0) {
          <div class="footer-update">
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Última actualización: {{ ultimaActualizacion }}
          </div>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    .fondo-ciudadano {
      --background: #f5f7f5;
    }

    /* ── Hero Ciudadano ── */
    .hero-ciudadano {
      background: linear-gradient(135deg, #1e8c34 0%, #156b27 100%);
      padding: 48px 20px 32px;
      position: relative;
      overflow: hidden;
    }
    .hero-ciudadano::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 0;
      right: 0;
      height: 40px;
      background: #f5f7f5;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }
    .hero-ciudadano::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      top: -70px;
      right: -50px;
    }
    .hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    .hero-marca-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hero-logo {
      width: 32px;
      height: 32px;
      background: #fff;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-logo-img {
      width: 28px;
      height: 28px;
      object-fit: contain;
      border-radius: 50%;
    }
    .hero-marca {
      font-size: 0.85rem;
      font-weight: 900;
      color: #fff;
    }
    .hero-badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #fff;
    }
    .hero-badge svg {
      width: 14px;
      height: 14px;
      fill: #fff;
    }
    .hero-titulo {
      font-size: 1.4rem;
      font-weight: 900;
      color: #fff;
      margin: 0 0 6px;
      position: relative;
      z-index: 1;
    }
    .hero-subtitulo {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.8);
      margin: 0 0 12px;
      position: relative;
      z-index: 1;
    }
    .hero-fecha {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.68rem;
      color: rgba(255,255,255,0.7);
      position: relative;
      z-index: 1;
    }
    .hero-fecha svg {
      width: 12px;
      height: 12px;
      fill: rgba(255,255,255,0.7);
    }

    /* ── Content ── */
    .content {
      padding: 20px 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ── Stats Resumen ── */
    .stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 4px;
    }
    .stat-card-resumen {
      background: #fff;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      border: 1px solid #e8ece8;
    }
    .stat-ico-resumen {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-ico-resumen svg {
      width: 22px;
      height: 22px;
    }
    .stat-ico-resumen.verde {
      background: #e8f5e9;
    }
    .stat-ico-resumen.verde svg {
      fill: #1e8c34;
    }
    .stat-ico-resumen.naranja {
      background: #fff3e0;
    }
    .stat-ico-resumen.naranja svg {
      fill: #e65100;
    }
    .stat-num-resumen {
      display: block;
      font-size: 1.6rem;
      font-weight: 900;
      color: #1a2e1a;
      line-height: 1.2;
    }
    .stat-lbl-resumen {
      font-size: 0.6rem;
      color: #9e9e9e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ── Carga ── */
    .centro-carga {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
      gap: 12px;
    }
    .spinner-verde {
      --color: #1e8c34;
    }
    .cargando-txt {
      font-size: 0.85rem;
      color: #9e9e9e;
    }

    /* ── Vacío ── */
    .vacio-ciudadano {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
      gap: 12px;
      background: #fff;
      border-radius: 20px;
      margin-top: 1rem;
    }
    .vacio-ico-ciudadano {
      width: 70px;
      height: 70px;
      background: #e8f5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vacio-ico-ciudadano svg {
      width: 32px;
      height: 32px;
      fill: #1e8c34;
    }
    .vacio-txt-ciudadano {
      font-size: 1rem;
      font-weight: 700;
      color: #333;
      margin: 0;
    }
    .vacio-sub-ciudadano {
      font-size: 0.75rem;
      color: #9e9e9e;
      margin: 0;
    }

    /* ── Sección Header ── */
    .sec-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 4px 0 0;
    }
    .sec-titulo {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      font-weight: 900;
      color: #1e8c34;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .sec-titulo svg {
      fill: #1e8c34;
    }
    .sec-refresco {
      font-size: 0.6rem;
      color: #bdbdbd;
    }

    /* ── Card Camión ── */
    .camion-card {
      background: #fff;
      border-radius: 18px;
      padding: 16px;
      border: 1px solid #eef2ee;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }
    .camion-card:active {
      transform: scale(0.98);
      background: #fafcfa;
    }
    .camion-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .camion-icono {
      width: 48px;
      height: 48px;
      background: #e8f5e9;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .camion-icono svg {
      width: 26px;
      height: 26px;
      fill: #1e8c34;
    }
    .camion-info {
      flex: 1;
    }
    .camion-ruta {
      font-size: 0.95rem;
      font-weight: 800;
      color: #1a2e1a;
      margin: 0 0 6px;
    }
    .camion-detalles {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .detalle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.68rem;
      color: #9e9e9e;
    }
    .detalle svg {
      fill: #bdbdbd;
    }
    .estado-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #e8f5e9;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.6rem;
      font-weight: 800;
      color: #1e8c34;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    .punto-vivo {
      width: 8px;
      height: 8px;
      background: #1e8c34;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
    .camion-footer {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #f0f4f0;
    }
    .ver-mapa {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #1565c0;
    }
    .ver-mapa svg {
      fill: #1565c0;
    }

    /* ── Footer Update ── */
    .footer-update {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.6rem;
      color: #bdbdbd;
      padding: 12px 0 8px;
    }
    .footer-update svg {
      fill: #bdbdbd;
    }
  `]
})
export class RutasCiudadanoPagina implements OnInit, OnDestroy {
  recorridos: any[] = [];
  cargandoPrimera = true;
  ultimaActualizacion = '';
  private intervalo: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  get rutasUnicas(): number {
    const nombres = new Set(this.recorridos.map(r => r.ruta_nombre || r.ruta_id));
    return nombres.size;
  }

  get fechaActual(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  ngOnInit() {
    this.cargarRecorridos();
    this.intervalo = setInterval(() => this.cargarRecorridos(), 30000);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  cargarRecorridos() {
    this.http.get<any>(`${environment.apiUrl}/recorridos/activos-publico`).subscribe({
      next: (res) => {
        this.recorridos = res.data ?? [];
        this.cargandoPrimera = false;
        this.ultimaActualizacion = new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      },
      error: async (err) => {
        this.cargandoPrimera = false;
        const toast = await this.toastController.create({
          message: err?.error?.message || 'Error al obtener recorridos activos',
          duration: 4000,
          color: 'danger',
          position: 'bottom'
        });
        await toast.present();
      }
    });
  }

  async handleRefresh(event: any) {
    await this.cargarRecorridos();
    event.target.complete();
  }

  irAlMapa(recorridoId: string) {
    this.router.navigate(['/mapa', recorridoId]);
  }

  formatearHora(timestamp: string): string {
    if (!timestamp) return '—';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  }
}