import { Component } from '@angular/core';
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
  selector: 'app-login',
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
  templateUrl: './login.componente.html',
  styleUrls: ['./login.componente.css'],
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
    // limpiar errores de servidor previos
    this.clearServerErrors();
    const { username, password } = this.formulario.value;

    this.authServicio.login(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        // determinar campo incorrecto a partir del mensaje del backend
        const msg = err?.error?.message ?? err?.message ?? '';

        if (err && err.status === 401) {
          const lower = String(msg).toLowerCase();
          if (lower.includes('usuario')) {
            this.setServerError('username', msg || 'Usuario incorrecto');
            // limpiar posible error del otro campo
            this.formulario.get('password')?.setErrors(null);
          } else if (lower.includes('contraseña') || lower.includes('contrasena')) {
            this.setServerError('password', msg || 'Contraseña incorrecta');
            this.formulario.get('username')?.setErrors(null);
          } else {
            // si no se sabe, marcar ambos y mostrar mensaje general
            this.setServerError('username', 'Usuario incorrecto');
            this.setServerError('password', 'Contraseña incorrecta');
            this.error = 'Usuario o contraseña incorrectos';
          }

          // asegurar que los campos se muestran como tocados y la UI refleje el error
          this.formulario.get('username')?.markAsTouched();
          this.formulario.get('password')?.markAsTouched();
        } else {
          this.error = 'Error del servidor. Intenta más tarde';
        }

        this.cargando = false;
      },
    });
  }

  private setServerError(controlName: string, message: string) {
    const control = this.formulario.get(controlName);
    if (!control) return;
    const existing = control.errors || {};
    existing['server'] = message;
    control.setErrors(existing);
    control.markAsTouched();
  }

  private clearServerErrors() {
    ['username', 'password'].forEach(name => {
      const control = this.formulario.get(name);
      if (!control) return;
      const errs = { ...(control.errors || {}) };
      if (errs['server']) {
        delete errs['server'];
        const keys = Object.keys(errs);
        control.setErrors(keys.length ? errs : null);
      }
    });
  }
}