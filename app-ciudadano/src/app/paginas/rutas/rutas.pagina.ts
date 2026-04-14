import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonNote,
  IonBadge,
  ToastController
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rutas-ciudadano',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonNote,
    IonBadge
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Camiones en ruta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="fondo-oscuro">
      @if (cargandoPrimera) {
        <div class="contenedor-centrado">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Buscando camiones activos...</p>
        </div>
      } @else {
        @if (recorridos.length === 0) {
          <div class="contenedor-centrado msg-vacio">
            <p class="emoji-vacio">🚌</p>
            <p>No hay camiones en ruta en este momento</p>
          </div>
        } @else {
          <ion-list class="lista-transparente">
            @for (r of recorridos; track r.id) {
              <ion-item
                button
                detail
                class="item-recorrido"
                (click)="irAlMapa(r.id)"
                lines="none"
              >
                <ion-label>
                  <h2 class="nombre-ruta">{{ r.ruta_nombre || 'Ruta ' + r.ruta_id }}</h2>
                  <ion-note class="detalle-fila">
                    🚐 {{ r.vehiculo_placa }} · {{ r.vehiculo_marca }}
                  </ion-note>
                  <ion-note class="detalle-fila">
                    🕐 Início: {{ formatearHora(r.timestamp_inicio) }}
                  </ion-note>
                </ion-label>
                <ion-badge slot="end" color="success">En ruta</ion-badge>
              </ion-item>
            }
          </ion-list>
        }
      }
    </ion-content>
  `,
  styles: [`
    .fondo-oscuro {
      --background: #121212;
      color: #e0e0e0;
    }
    .contenedor-centrado {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      text-align: center;
      color: #a0a0a0;
    }
    .emoji-vacio {
      font-size: 3rem;
      margin-bottom: 5px;
    }
    .lista-transparente {
      background: transparent;
      padding: 12px;
    }
    .item-recorrido {
      --background: #1e1e1e;
      --color: #e0e0e0;
      margin-bottom: 10px;
      border-radius: 10px;
      --inner-padding-end: 16px;
    }
    .nombre-ruta {
      font-weight: 600;
      font-size: 1.05rem;
      margin-bottom: 4px;
    }
    .detalle-fila {
      display: block;
      color: #a0a0a0;
      font-size: 0.85rem;
      margin-top: 2px;
    }
    ion-badge {
      align-self: center;
    }
  `]
})
export class RutasCiudadanoPagina implements OnInit, OnDestroy {
  recorridos: any[] = [];
  cargandoPrimera = true;
  private intervalo: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarRecorridos();
    // Polling cada 30 segundos
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
