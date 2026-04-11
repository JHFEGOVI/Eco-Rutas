import { Component, OnInit } from '@angular/core';
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
  IonButton,
  IonSpinner,
  IonButtons,
  IonIcon,
  ToastController,
  IonBadge
} from '@ionic/angular/standalone';
import { AuthServicio } from '../../servicios/auth.servicio';
import { environment } from '../../../environments/environment';
import { addIcons } from 'ionicons';
import { logOutOutline, playCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-rutas',
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
    IonButton,
    IonSpinner,
    IonButtons,
    IonIcon,
    IonBadge
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mis Rutas (Hoy)</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarSesion()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding fondo-oscuro">
      @if (cargando) {
        <div class="contenedor-centrado">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando rutas...</p>
        </div>
      } @else {
        @if (rutas.length === 0) {
          <div class="contenedor-centrado msg-vacio">
            <p>No tienes rutas asignadas para hoy</p>
          </div>
        } @else {
          <ion-list class="lista-transparente">
            @for (ruta of rutas; track ruta.id) {
              <ion-item class="item-ruta" lines="none">
                <ion-label>
                  <h2>{{ ruta.ruta_nombre || 'Ruta ' + ruta.ruta_id }}</h2>
                  <p>Fecha: {{ formatearFecha(ruta.fecha) }}</p>
                </ion-label>
                
                <div class="acciones-finales">
                  <ion-badge [color]="colorEstado(ruta.estado)">
                    {{ etiquetaEstado(ruta.estado) }}
                  </ion-badge>
                  
                  @if (ruta.estado === 'pendiente') {
                    <ion-button 
                      fill="clear" 
                      color="success" 
                      (click)="iniciarRecorrido(ruta)"
                      [disabled]="procesandoRecorrido"
                    >
                      <ion-icon slot="start" name="play-circle-outline"></ion-icon>
                      Iniciar recorrido
                    </ion-button>
                  }
                </div>
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
    .msg-vacio p {
      font-size: 1.1rem;
    }
    .lista-transparente {
      background: transparent;
    }
    .item-ruta {
      --background: #1e1e1e;
      --color: #e0e0e0;
      margin-bottom: 12px;
      border-radius: 8px;
    }
    .acciones-finales {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
    ion-badge {
      font-size: 0.8rem;
      padding: 4px 8px;
    }
  `]
})
export class RutasPagina implements OnInit {
  cargando = true;
  procesandoRecorrido = false;
  rutas: any[] = [];
  usuarioActual: any;

  constructor(
    private authServicio: AuthServicio,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ logOutOutline, playCircleOutline });
  }

  async ngOnInit() {
    this.usuarioActual = await this.authServicio.obtenerUsuario();
    if (this.usuarioActual && this.usuarioActual.id) {
      this.cargarRutasAsignadas(this.usuarioActual.id);
    } else {
      this.cargando = false;
    }
  }

  cargarRutasAsignadas(conductorId: string) {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/asignaciones/conductor/${conductorId}`).subscribe({
      next: (res) => {
        this.rutas = res.data || [];
        this.cargando = false;
      },
      error: async (err) => {
        this.cargando = false;
        await this.mostrarError(err?.error?.message || 'Error al cargar rutas asignadas');
      }
    });
  }

  iniciarRecorrido(ruta: any) {
    if (this.procesandoRecorrido) return;
    this.procesandoRecorrido = true;
    
    // Al enviar el POST a /recorridos/iniciar, el backend determina el requerimiento en base al JWT del interceptor
    this.http.post<any>(`${environment.apiUrl}/recorridos/iniciar`, {}).subscribe({
      next: (res) => {
        this.procesandoRecorrido = false;
        const recorridoCreado = res.data;
        if (recorridoCreado && recorridoCreado.id) {
          this.router.navigate(['/recorrido', recorridoCreado.id]);
        }
      },
      error: async (err) => {
        this.procesandoRecorrido = false;
        await this.mostrarError(err?.error?.message || 'No se pudo iniciar el recorrido. Verifica disponibilidad de vehículos.');
      }
    });
  }

  async cerrarSesion() {
    await this.authServicio.cerrarSesion();
  }

  colorEstado(estado: string): string {
    const mapa: any = {
      'pendiente': 'primary',
      'en_curso': 'warning',
      'completada': 'success',
      'cancelada': 'medium'
    };
    return mapa[estado] || 'light';
  }

  etiquetaEstado(estado: string): string {
    const mapa: any = {
      'pendiente': 'Pendiente',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return mapa[estado] || estado;
  }

  formatearFecha(fechaIso: string): string {
    if (!fechaIso) return '';
    try {
      const parts = fechaIso.split('T')[0].split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      return fechaIso;
    }
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }
}
