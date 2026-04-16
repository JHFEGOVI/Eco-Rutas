import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import {
  IonContent,
  IonButtons,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

// Corrección de íconos de Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({ 
  iconUrl, 
  iconRetinaUrl, 
  shadowUrl, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});

// Centro y límites Buenaventura
const CENTRO_BUENAVENTURA: L.LatLngExpression = [3.8801, -77.0311];
const BOUNDS_BUENAVENTURA = L.latLngBounds(
  L.latLng(3.7800, -77.2100),
  L.latLng(3.9700, -76.8900)
);

@Component({
  selector: 'app-mapa-ciudadano',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButtons,
    IonSpinner
  ],
  template: `
    <ion-content [scrollY]="false" class="fondo-mapa">
      
      <!-- HEADER FLOTANTE -->
      <div class="header-flotante">
        <button class="btn-back" (click)="volver()">
          <svg viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div class="header-info">
          <h1 class="header-titulo">{{ recorrido?.ruta_nombre || 'Seguimiento' }}</h1>
          <div class="header-badge">
            <span class="punto-vivo"></span>
            EN VIVO
          </div>
        </div>
        <div style="width: 40px;"></div>
      </div>

      <!-- MAPA -->
      <div id="mapa-ciudadano" class="mapa-fullscreen"></div>

      <!-- PANEL INFERIOR -->
      <div class="panel-inferior" [class.panel-cargando]="!recorrido">
        @if (!recorrido && cargando) {
          <div class="cargando-panel">
            <ion-spinner name="crescent" class="spinner-verde"></ion-spinner>
            <p>Localizando camión...</p>
          </div>
        } @else if (recorrido) {
          <div class="vehiculo-info">
            <div class="vehiculo-icono">
              <svg viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <div class="vehiculo-detalles">
              <p class="vehiculo-placa">{{ recorrido.vehiculo_placa }}</p>
              <p class="vehiculo-marca">{{ recorrido.vehiculo_marca }}</p>
            </div>
            <div class="vehiculo-estado">
              <span class="estado-tag">En movimiento</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-ico">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
              </div>
              <div>
                <span class="info-lbl">Ruta</span>
                <span class="info-val">{{ recorrido.ruta_nombre || '—' }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-ico">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div>
                <span class="info-lbl">Actualización</span>
                <span class="info-val">{{ ultimaActualizacion || 'Localizando...' }}</span>
              </div>
            </div>
          </div>

          <div class="footer-info">
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span>Actualización automática cada 10 segundos</span>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .fondo-mapa {
      --background: #1a2e1a;
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 0;
      --padding-end: 0;
    }

    /* ── Header Flotante ── */
    .header-flotante {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      padding-top: calc(12px + env(safe-area-inset-top, 0px));
      background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%);
    }
    .btn-back {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.95);
      border: none;
      border-radius: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
    }
    .btn-back:active {
      transform: scale(0.94);
      background: #fff;
    }
    .btn-back svg {
      width: 20px;
      height: 20px;
      fill: #1e8c34;
    }
    .header-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .header-titulo {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.3);
      text-align: center;
    }
    .header-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(30,140,52,0.9);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.6rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.8px;
      backdrop-filter: blur(4px);
    }
    .punto-vivo {
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.2); }
    }

    /* ── Mapa ── */
    .mapa-fullscreen {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    /* ── Panel Inferior ── */
    .panel-inferior {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      border-radius: 24px 24px 0 0;
      padding: 20px 20px 28px;
      z-index: 1000;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.12);
      transition: all 0.3s ease;
    }
    .panel-cargando {
      padding: 32px 20px;
    }
    .cargando-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: #9e9e9e;
    }
    .cargando-panel p {
      margin: 0;
      font-size: 0.85rem;
    }
    .spinner-verde {
      --color: #1e8c34;
    }

    /* ── Vehículo Info ── */
    .vehiculo-info {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f4f0;
    }
    .vehiculo-icono {
      width: 52px;
      height: 52px;
      background: #e8f5e9;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vehiculo-icono svg {
      width: 30px;
      height: 30px;
      fill: #1e8c34;
    }
    .vehiculo-detalles {
      flex: 1;
    }
    .vehiculo-placa {
      margin: 0 0 2px;
      font-size: 1.1rem;
      font-weight: 900;
      color: #1a2e1a;
    }
    .vehiculo-marca {
      margin: 0;
      font-size: 0.7rem;
      color: #9e9e9e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .vehiculo-estado {
      flex-shrink: 0;
    }
    .estado-tag {
      background: #e8f5e9;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #1e8c34;
    }

    /* ── Grid Info ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .info-item {
      background: #f8faf8;
      border-radius: 14px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .info-ico {
      width: 34px;
      height: 34px;
      background: #fff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #eef2ee;
    }
    .info-ico svg {
      width: 16px;
      height: 16px;
      fill: #1e8c34;
    }
    .info-lbl {
      display: block;
      font-size: 0.6rem;
      color: #bdbdbd;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .info-val {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: #1a2e1a;
    }

    /* ── Footer ── */
    .footer-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding-top: 12px;
      font-size: 0.6rem;
      color: #bdbdbd;
      border-top: 1px solid #f0f4f0;
    }
    .footer-info svg {
      fill: #bdbdbd;
    }
  `]
})
export class MapaCiudadanoPagina implements OnInit, AfterViewInit, OnDestroy {
  recorridoId: string | null = null;
  recorrido: any = null;
  ultimaActualizacion: string | null = null;
  cargando = true;

  private mapa: L.Map | null = null;
  private marcadorCamion: L.Marker | null = null;
  private polilinaRuta: L.Polyline | null = null;
  private intervalo: any;
  private mapaListo = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.recorridoId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
      this.cargarDatos();
      this.intervalo = setInterval(() => this.cargarDatos(), 10000);
    }, 300);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
  }

  
  volver() {
    this.location.back();
  }

  inicializarMapa() {
    this.mapa = L.map('mapa-ciudadano', {
      center: CENTRO_BUENAVENTURA,
      zoom: 13,
      maxBounds: BOUNDS_BUENAVENTURA,
      maxBoundsViscosity: 1.0,
      minZoom: 11
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapa);

    this.mapaListo = true;
  }

  cargarDatos() {
    this.http.get<any>(`${environment.apiUrl}/recorridos/activos-publico`).subscribe({
      next: (res) => {
        const lista: any[] = res.data ?? [];
        const encontrado = lista.find(r => r.id === this.recorridoId);
        
        if (!encontrado) {
          if (!this.cargando) {
            this.mostrarError('El recorrido ya no está activo');
            this.volver();
          }
          return;
        }

        this.recorrido = encontrado;
        this.cargando = false;
        this.ultimaActualizacion = new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        if (this.mapaListo && this.mapa) {
          this.dibujarRuta(encontrado);
          this.actualizarMarcador(encontrado);
        }
      },
      error: async (err) => {
        if (!this.cargando) {
          await this.mostrarError(err?.error?.message || 'Error al obtener datos del recorrido');
        }
      }
    });
  }

  dibujarRuta(r: any) {
    if (!this.mapa || !r.ruta_geometria) return;

    if (this.polilinaRuta) {
      this.polilinaRuta.remove();
    }

    try {
      const geo = r.ruta_geometria;
      const coordenadas: L.LatLngExpression[] = geo.coordinates.map(
        (c: number[]) => [c[1], c[0]] as L.LatLngExpression
      );
      
      this.polilinaRuta = L.polyline(coordenadas, { 
        color: '#1e8c34', 
        weight: 4, 
        opacity: 0.7,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(this.mapa!);
      
      if (!this.marcadorCamion) {
        this.mapa!.fitBounds(this.polilinaRuta.getBounds(), { padding: [40, 40] });
      }
    } catch (e) {
      console.error('Error al dibujar la ruta:', e);
    }
  }

  actualizarMarcador(r: any) {
    if (!this.mapa || !r.ultima_posicion) return;

    const { lat, lon } = r.ultima_posicion;
    const pos: L.LatLngExpression = [lat, lon];

    const camionIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background: #1e8c34;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(30,140,52,0.4);
          border: 2px solid #fff;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      popupAnchor: [0, -16]
    });

    if (this.marcadorCamion) {
      this.marcadorCamion.setLatLng(pos);
    } else {
      this.marcadorCamion = L.marker(pos, { icon: camionIcon })
        .addTo(this.mapa!)
        .bindPopup(`
          <strong style="color:#1e8c34">${r.vehiculo_placa}</strong><br>
          ${r.ruta_nombre || 'Ruta en curso'}<br>
          <span style="font-size:0.7rem">🟢 Actualizado ahora</span>
        `)
        .openPopup();
    }

    if (this.mapa && this.marcadorCamion) {
      const bounds = this.mapa.getBounds();
      if (!bounds.contains(pos)) {
        this.mapa.setView(pos, this.mapa.getZoom());
      }
    }
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}