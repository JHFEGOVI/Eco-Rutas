import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthServicio } from '../../servicios/auth.servicio';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonSpinner,
  ],
  templateUrl:'./login.pagina.html',
  styleUrls: ['./login.pagina.css'],
})
export class LoginPagina {
  formulario: FormGroup;
  cargando = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authServicio: AuthServicio,
    private toastController: ToastController,
  ) {
    this.formulario = this.fb.group({
      usuario:   ['', Validators.required],
      contrasena:['', Validators.required],
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
        console.log('[Login] Login exitoso, iniciando sincronización...');
        // Iniciar sincronización automática de datos del usuario cada 2 segundos
        this.authServicio.iniciarSincronizacionAutomatica(2);
        this.router.navigate(['/rutas']);
      },
      error: async (err) => {
        this.cargando = false;
        const mensaje = err?.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        await this.mostrarError(mensaje);
      },
    });
  }

  async mostrarError(mensaje: string) {
    this.error = mensaje;
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }
}