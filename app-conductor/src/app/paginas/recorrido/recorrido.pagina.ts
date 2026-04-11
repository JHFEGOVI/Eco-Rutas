import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
import { checkmarkDoneOutline, arrowBackOutline, closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-recorrido',
  standalone: true,
  imports: [
    CommonModule,
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
                  <strong>Hora de Inicio (GPS):</strong> 
                  <span>{{ formatearHora(recorridoActivo.timestamp_inicio) }}</span>
                </div>
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
    }
    .msg-vacio h2 {
      color: #a0a0a0;
      font-size: 1.2rem;
      font-weight: 500;
      margin-top: 10px;
    }
    .msg-vacio ion-icon {
      font-size: 4rem;
      margin-bottom: 5px;
    }
    .contenedor-top {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-bottom: 20px;
    }
    .tarjeta-recorrido {
      --background: #1e1e1e;
      --color: #e0e0e0;
      border-radius: 12px;
      margin: 0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    ion-card-title {
      font-size: 1.4rem;
      color: #ffffff;
      margin-top: 5px;
    }
    .info-row {
      margin-bottom: 12px;
      font-size: 1rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-row strong {
      color: #a0a0a0;
      font-size: 0.9rem;
    }
    .placa-vehiculo {
      color: #4caf50;
      font-weight: 600;
      font-size: 1.1rem;
    }
    .contenedor-boton {
      margin-top: 30px;
    }
    .boton-finalizar {
      --border-radius: 12px;
      box-shadow: 0 4px 10px rgba(46, 125, 50, 0.4);
      height: 60px;
      font-size: 1.2rem;
      font-weight: bold;
    }
  `]
})
export class RecorridoPagina implements OnInit {
  cargando = true;
  procesando = false;
  recorridoActivo: any = null;
  recorridoIdUrl: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ checkmarkDoneOutline, arrowBackOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.recorridoIdUrl = this.activatedRoute.snapshot.paramMap.get('id');
    this.cargarRecorridoActivo();
  }

  cargarRecorridoActivo() {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/recorridos/activo`).subscribe({
      next: (res) => {
        this.recorridoActivo = res.data || null;
        this.cargando = false;
      },
      error: async (err) => {
        this.cargando = false;
        await this.mostrarError(err?.error?.message || 'Error al obtener estado del recorrido');
      }
    });
  }

  finalizarRecorrido() {
    if (!this.recorridoActivo?.id) return;
    
    this.procesando = true;
    this.http.post<any>(`${environment.apiUrl}/recorridos/${this.recorridoActivo.id}/finalizar`, {}).subscribe({
      next: async () => {
        this.procesando = false;
        
        const toast = await this.toastController.create({
          message: '¡Recorrido finalizado exitosamente!',
          duration: 3000,
          color: 'success',
          position: 'bottom',
          icon: 'checkmark-done-outline'
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
      const date = new Date(timestamp);
      // Muestra solo la hora y minutos (e.g. "14:30")
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
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
