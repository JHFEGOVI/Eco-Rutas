import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButtons,
  IonBackButton,
  ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

// Corrección de íconos de Leaflet (igual que en el web-admin)
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });

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
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonButtons,
    IonBackButton
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/rutas"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ recorrido?.ruta_nombre || 'Seguimiento' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="contenido-mapa">
      <div id="mapa-ciudadano" class="mapa-fullscreen"></div>

      <ion-card class="panel-info">
        <ion-card-content>
          @if (recorrido) {
            <div class="info-row">
              <strong>Ruta:</strong> {{ recorrido.ruta_nombre || '—' }}
            </div>
            <div class="info-row">
              <strong>Vehículo:</strong> {{ recorrido.vehiculo_placa }} · {{ recorrido.vehiculo_marca }}
            </div>
            <div class="info-row">
              <strong>Última actualización:</strong> {{ ultimaActualizacion || 'Localizando...' }}
            </div>
          } @else {
            <p class="sin-datos">Buscando recorrido...</p>
          }
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [`
    .contenido-mapa {
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 0;
      --padding-end: 0;
      display: flex;
      flex-direction: column;
    }
    .mapa-fullscreen {
      flex: 1;
      height: calc(100vh - 56px - 110px);
      width: 100%;
      z-index: 0;
    }
    .panel-info {
      margin: 8px;
      border-radius: 12px;
      --background: #1e1e1e;
      --color: #e0e0e0;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
    }
    .info-row {
      font-size: 0.9rem;
      margin-bottom: 5px;
      color: #e0e0e0;
    }
    .info-row strong {
      color: #a0a0a0;
    }
    .sin-datos {
      color: #a0a0a0;
      text-align: center;
    }
  `]
})
export class MapaCiudadanoPagina implements OnInit, AfterViewInit, OnDestroy {
  recorridoId: string | null = null;
  recorrido: any = null;
  ultimaActualizacion: string | null = null;

  private mapa: L.Map | null = null;
  private marcadorCamion: L.Marker | null = null;
  private polilinaRuta: L.Polyline | null = null;
  private intervalo: any;
  private mapaListo = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.recorridoId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {
    // Pequeño delay para que Ionic termine de renderizar el contenedor
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
        if (!encontrado) return;

        this.recorrido = encontrado;
        this.ultimaActualizacion = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (this.mapaListo && this.mapa) {
          this.dibujarRuta(encontrado);
          this.actualizarMarcador(encontrado);
        }
      },
      error: async (err) => {
        const toast = await this.toastController.create({
          message: err?.error?.message || 'Error al obtener datos del recorrido',
          duration: 3000, color: 'warning', position: 'bottom'
        });
        await toast.present();
      }
    });
  }

  dibujarRuta(r: any) {
    if (!this.mapa || !r.ruta_geometria || this.polilinaRuta) return;

    try {
      const geo = r.ruta_geometria;
      // GeoJSON LineString: coordenadas en [lng, lat], Leaflet las espera en [lat, lng]
      const coordenadas: L.LatLngExpression[] = geo.coordinates.map(
        (c: number[]) => [c[1], c[0]] as L.LatLngExpression
      );
      this.polilinaRuta = L.polyline(coordenadas, { color: '#2196F3', weight: 4, opacity: 0.8 }).addTo(this.mapa!);
      this.mapa.fitBounds(this.polilinaRuta.getBounds(), { padding: [30, 30] });
    } catch (e) {
      console.error('Error al dibujar la ruta:', e);
    }
  }

  actualizarMarcador(r: any) {
    if (!this.mapa || !r.ultima_posicion) return;

    const { lat, lon } = r.ultima_posicion;
    const pos: L.LatLngExpression = [lat, lon];

    if (this.marcadorCamion) {
      this.marcadorCamion.setLatLng(pos);
    } else {
      this.marcadorCamion = L.marker(pos)
        .addTo(this.mapa!)
        .bindPopup(`<strong>${r.vehiculo_placa}</strong><br>${r.ruta_nombre}`)
        .openPopup();
    }
  }
}
