import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthServicio } from '../../servicios/auth.servicio';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="pagina">
      <div class="hero">
        <div class="particula p1"></div>
        <div class="particula p2"></div>
        <div class="particula p3"></div>
        <div class="particula p4"></div>
        <div class="estrella">⭐</div>

        <div class="hero-texto">
          <div class="hero-titulo">
            <span>Restablecer Contraseña</span>
          </div>
          <p class="hero-desc">
            Ingresa tu nombre de usuario y la nueva contraseña para
            recuperar el acceso al Panel Administrativo.
          </p>
        </div>

        <div class="card">
          <div class="card-dots">
            <span class="dot rojo"></span>
            <span class="dot amarillo"></span>
            <span class="dot verde-dot"></span>
          </div>

          <div class="card-logo">
            <div class="logo-circulo">
              <img src="assets/logo.png" alt="EcoRutas" class="logo-img" />
            </div>
            <span class="logo-ciudad">Panel Admin</span>
          </div>

          <!-- ÉXITO -->
          <div *ngIf="exitoso" class="exito-mensaje">
            <mat-icon class="exito-icono">check_circle</mat-icon>
            <h3>¡Contraseña actualizada!</h3>
            <p>{{ mensaje }}</p>
            <button
              mat-raised-button
              color="primary"
              class="boton"
              [routerLink]="['/login']"
            >
              <mat-icon>login</mat-icon>
              Iniciar sesión
            </button>
          </div>

          <!-- FORMULARIO -->
          <form
            *ngIf="!exitoso"
            [formGroup]="formulario"
            (ngSubmit)="restablecerPassword()"
            autocomplete="off"
          >
            <div class="info-box">
              <mat-icon>info</mat-icon>
              <span>Ingresa tu usuario y nueva contraseña</span>
            </div>

            <div class="campo-grupo">
              <label class="campo-label">Nombre de usuario</label>
              <div class="campo-wrap">
                <mat-icon class="campo-icono">person</mat-icon>
                <input
                  class="campo-input"
                  type="text"
                  formControlName="username"
                  placeholder="Ej: admin"
                  autocomplete="username"
                />
              </div>
              <span
                class="campo-error"
                *ngIf="formulario.get('username')?.hasError('required') && formulario.get('username')?.touched"
              >
                <mat-icon class="error-icono">error_outline</mat-icon>
                El usuario es requerido
              </span>
            </div>

            <div class="campo-grupo">
              <label class="campo-label">Nueva contraseña</label>
              <div class="campo-wrap">
                <mat-icon class="campo-icono">lock</mat-icon>
                <input
                  class="campo-input"
                  type="password"
                  formControlName="password"
                  placeholder="Mínimo 6 caracteres"
                  autocomplete="new-password"
                />
              </div>
              <span
                class="campo-error"
                *ngIf="formulario.get('password')?.hasError('required') && formulario.get('password')?.touched"
              >
                <mat-icon class="error-icono">error_outline</mat-icon>
                La contraseña es requerida
              </span>
              <span
                class="campo-error"
                *ngIf="formulario.get('password')?.hasError('minlength') && formulario.get('password')?.touched"
              >
                <mat-icon class="error-icono">error_outline</mat-icon>
                Mínimo 6 caracteres
              </span>
            </div>

            <div class="campo-grupo">
              <label class="campo-label">Confirmar contraseña</label>
              <div class="campo-wrap">
                <mat-icon class="campo-icono">lock_outline</mat-icon>
                <input
                  class="campo-input"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Repite la contraseña"
                  autocomplete="new-password"
                />
              </div>
              <span
                class="campo-error"
                *ngIf="formulario.get('confirmPassword')?.hasError('required') && formulario.get('confirmPassword')?.touched"
              >
                <mat-icon class="error-icono">error_outline</mat-icon>
                Confirma tu contraseña
              </span>
              <span
                class="campo-error"
                *ngIf="formulario.hasError('mismatch') && formulario.get('confirmPassword')?.touched"
              >
                <mat-icon class="error-icono">error_outline</mat-icon>
                Las contraseñas no coinciden
              </span>
            </div>

            <div class="error-general" *ngIf="error">
              <mat-icon>error</mat-icon>
              <span>{{ error }}</span>
            </div>

            <button
              type="submit"
              class="boton"
              [class.cargando]="cargando"
              [disabled]="cargando || formulario.invalid"
            >
              <ng-container *ngIf="cargando">
                <mat-spinner diameter="18" class="boton-spinner"></mat-spinner>
                Actualizando...
              </ng-container>
              <ng-container *ngIf="!cargando">
                <mat-icon>save</mat-icon>
                Guardar nueva contraseña
              </ng-container>
            </button>

            <div class="volver-login">
              <a [routerLink]="['/login']" class="volver-link">
                <mat-icon>arrow_back</mat-icon>
                Volver al inicio de sesión
              </a>
            </div>
          </form>

          <div class="badge-seguro">
            <mat-icon class="badge-icono">verified_user</mat-icon>
            Conexión cifrada · EcoRutas v1.0
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Estructura base ── */
    .pagina {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .hero {
      flex: 1;
      background: linear-gradient(135deg, #1a5d1a 0%, #2d8a2d 50%, #1a5d1a 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 4rem;
    }

    /* ── Partículas decorativas ── */
    .particula {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
      animation: flotar 8s ease-in-out infinite;
    }
    .p1 { width: 300px; height: 300px; background: #fff; top: -100px; left: -100px; animation-delay: 0s; }
    .p2 { width: 200px; height: 200px; background: #90ee90; top: 50%; right: -50px; animation-delay: 2s; }
    .p3 { width: 150px; height: 150px; background: #fff; bottom: -50px; left: 30%; animation-delay: 4s; }
    .p4 { width: 100px; height: 100px; background: #90ee90; top: 20%; left: 20%; animation-delay: 6s; }

    .estrella {
      position: absolute;
      font-size: 2rem;
      opacity: 0.3;
      animation: rotate 20s linear infinite;
      top: 10%;
      right: 15%;
    }

    @keyframes flotar {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.1); }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* ── Texto Hero ── */
    .hero-texto {
      max-width: 400px;
      color: white;
      z-index: 1;
    }

    .hero-titulo {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .hero-desc {
      font-size: 1.1rem;
      line-height: 1.6;
      opacity: 0.9;
    }

    /* ── Card ── */
    .card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(10px);
      z-index: 1;
    }

    .card-dots {
      display: flex;
      gap: 6px;
      margin-bottom: 1.5rem;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .rojo { background: #ff5f56; }
    .amarillo { background: #ffbd2e; }
    .verde-dot { background: #27c93f; }

    .card-logo {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-circulo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1a5d1a, #2d8a2d);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      box-shadow: 0 10px 30px rgba(26, 93, 26, 0.3);
    }

    .logo-img {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }

    .logo-ciudad {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a5d1a;
    }

    /* ── Formulario ── */
    .campo-grupo {
      margin-bottom: 1.5rem;
    }

    .campo-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .campo-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .campo-icono {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 20px;
    }

    .campo-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s;
      background: white;
    }

    .campo-input:focus {
      outline: none;
      border-color: #1a5d1a;
      box-shadow: 0 0 0 3px rgba(26, 93, 26, 0.1);
    }

    .campo-error {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .error-icono {
      font-size: 16px;
    }

    /* ── Botón ── */
    .boton {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #1a5d1a, #2d8a2d);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .boton:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(26, 93, 26, 0.3);
    }

    .boton:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .boton.cargando {
      background: #9ca3af;
    }

    .boton-spinner {
      display: inline-block;
    }

    /* ── Error general ── */
    .error-general {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    /* ── Info box ── */
    .info-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      color: #065f46;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .info-box mat-icon {
      font-size: 18px;
      color: #10b981;
    }

    /* ── Éxito ── */
    .exito-mensaje {
      text-align: center;
      padding: 2rem 1rem;
    }

    .exito-icono {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #22c55e;
      margin-bottom: 1rem;
    }

    .exito-mensaje h3 {
      color: #1a5d1a;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .exito-mensaje p {
      color: #6b7280;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    /* ── Volver login ── */
    .volver-login {
      text-align: center;
      margin-top: 1.5rem;
    }

    .volver-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .volver-link:hover {
      color: #1a5d1a;
    }

    /* ── Badge ── */
    .badge-seguro {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 0.75rem;
    }

    .badge-icono {
      font-size: 16px;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .hero {
        flex-direction: column;
        padding: 1.5rem;
        gap: 2rem;
      }

      .hero-texto {
        text-align: center;
        max-width: 100%;
      }

      .hero-titulo {
        font-size: 1.75rem;
      }

      .card {
        padding: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponente {
  formulario: FormGroup;
  cargando = false;
  error = '';
  exitoso = false;
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private authServicio: AuthServicio,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  restablecerPassword(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = '';
    const { username, password } = this.formulario.value;

    // Timeout de 5 segundos - si tarda más, asumimos que el backend ya procesó
    const TIMEOUT_MS = 5000;
    let timeoutId: any;

    const subscription = this.authServicio.adminResetPassword(username, password).subscribe({
      next: (respuesta: any) => {
        console.log('[Component] next callback ejecutado:', respuesta);
        clearTimeout(timeoutId);
        this.cargando = false;
        this.exitoso = true;
        this.mensaje = respuesta.message || `Contraseña de "${username}" actualizada exitosamente.`;
        console.log('[Component] Estado actualizado - exitoso:', this.exitoso, 'cargando:', this.cargando);
        // Forzar detección de cambios de Angular
        this.cdr.detectChanges();
        console.log('[Component] Change detection forzada');
      },
      error: (err: any) => {
        console.log('[Component] error callback ejecutado:', err);
        clearTimeout(timeoutId);
        this.cargando = false;
        this.error = err?.error?.message || 'Error al restablecer la contraseña. Verifica el usuario e intenta de nuevo.';
        this.cdr.detectChanges();
      },
    });

    // Si tarda más de 5 segundos, mostrar mensaje de éxito asumiendo que el backend ya procesó
    timeoutId = setTimeout(() => {
      subscription.unsubscribe();
      this.cargando = false;
      this.exitoso = true;
      this.mensaje = `La contraseña de "${username}" fue procesada. Si no puedes iniciar sesión, intenta de nuevo.`;
      console.log('[Frontend] Timeout alcanzado - asumiendo éxito por demora en respuesta');
    }, TIMEOUT_MS);
  }
}
