import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { AuthServicio } from '../../servicios/auth.servicio';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner
  ],
  template: `
    <ion-content class="fondo-oscuro" [scrollY]="false">
      <div class="contenedor-centrado">
        <div class="cabecera-app">
          <h1 class="titulo-eco">EcoRutas</h1>
          <p class="subtitulo-eco">App Conductor</p>
        </div>

        <ion-card class="tarjeta-login">
          <ion-card-header>
            <ion-card-title class="ion-text-center">Iniciar Sesión</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <form [formGroup]="formulario" (ngSubmit)="iniciarSesion()">
              
              <ion-item class="campo-input">
                <ion-label position="stacked">Usuario</ion-label>
                <ion-input type="text" formControlName="usuario" placeholder="Ingrese su usuario"></ion-input>
              </ion-item>
              @if (formulario.get('usuario')?.hasError('required') && formulario.get('usuario')?.touched) {
                <div class="error-texto">El usuario es requerido</div>
              }

              <ion-item class="campo-input">
                <ion-label position="stacked">Contraseña</ion-label>
                <ion-input type="password" formControlName="contrasena" placeholder="Ingrese su contraseña"></ion-input>
              </ion-item>
              @if (formulario.get('contrasena')?.hasError('required') && formulario.get('contrasena')?.touched) {
                <div class="error-texto">La contraseña es requerida</div>
              }

              <div class="ion-margin-top contenedor-boton">
                <ion-button 
                  expand="block" 
                  type="submit" 
                  color="primary" 
                  [disabled]="formulario.invalid || cargando"
                >
                  @if (cargando) {
                    <ion-spinner name="crescent"></ion-spinner>
                  } @else {
                    Ingresar
                  }
                </ion-button>
              </div>

            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .fondo-oscuro {
      --background: #121212;
    }

    .contenedor-centrado {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 20px;
    }

    .cabecera-app {
      text-align: center;
      margin-bottom: 30px;
    }

    .titulo-eco {
      font-size: 2.5rem;
      font-weight: 800;
      color: #4caf50;
      margin: 0;
      letter-spacing: 1px;
    }

    .subtitulo-eco {
      font-size: 1.1rem;
      color: #a0a0a0;
      margin: 5px 0 0 0;
    }

    .tarjeta-login {
      width: 100%;
      max-width: 400px;
      border-radius: 12px;
      --background: #1e1e1e;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      margin: 0;
    }

    ion-card-title {
      color: #e0e0e0;
      font-weight: 600;
    }

    .campo-input {
      --background: transparent;
      --color: #e0e0e0;
      margin-bottom: 10px;
    }

    .error-texto {
      color: #ff5252;
      font-size: 0.8rem;
      padding-left: 16px;
      margin-top: -5px;
      margin-bottom: 10px;
    }

    .contenedor-boton {
      margin-top: 20px;
    }

    ion-button {
      --border-radius: 8px;
    }
  `]
})
export class LoginPagina {
  formulario: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authServicio: AuthServicio,
    private toastController: ToastController
  ) {
    this.formulario = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  async iniciarSesion() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const { usuario, contrasena } = this.formulario.value;

    this.authServicio.login(usuario, contrasena).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/rutas']);
      },
      error: async (err) => {
        this.cargando = false;
        const mensaje = err?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        await this.mostrarError(mensaje);
      }
    });
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
