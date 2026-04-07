import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthServicio } from '../../servicios/auth.servicio';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="contenedor">
      <mat-card class="tarjeta">
        <mat-card-content>
          <h1 class="titulo">EcoRutas</h1>
          <p class="subtitulo">Panel de administración</p>

          <form [formGroup]="formulario" (ngSubmit)="iniciarSesion()">
            <mat-form-field appearance="outline" class="campo">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="username" autocomplete="username" />
              @if (formulario.get('username')?.hasError('required') && formulario.get('username')?.touched) {
                <mat-error>El usuario es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="campo">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
              @if (formulario.get('password')?.hasError('required') && formulario.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
            </mat-form-field>

            @if (error) {
              <p class="mensaje-error">{{ error }}</p>
            }

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="boton"
              [disabled]="cargando"
            >
              @if (cargando) {
                <mat-spinner diameter="20" />
              } @else {
                Iniciar sesión
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .contenedor {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f2f5;
    }

    .tarjeta {
      width: 100%;
      max-width: 400px;
      padding: 16px;
    }

    .titulo {
      text-align: center;
      color: #1976d2;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .subtitulo {
      text-align: center;
      color: #757575;
      margin: 0 0 24px;
    }

    .campo {
      width: 100%;
      margin-bottom: 8px;
    }

    .mensaje-error {
      color: #d32f2f;
      font-size: 0.875rem;
      margin: 0 0 12px;
      text-align: center;
    }

    .boton {
      width: 100%;
      height: 44px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `],
})
export class LoginComponente {
  formulario: FormGroup;
  cargando = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authServicio: AuthServicio,
    private router: Router,
  ) {
    this.formulario = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = '';
    const { username, password } = this.formulario.value;

    this.authServicio.login(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al iniciar sesión. Verifica tus credenciales.';
        this.cargando = false;
      },
    });
  }
}
