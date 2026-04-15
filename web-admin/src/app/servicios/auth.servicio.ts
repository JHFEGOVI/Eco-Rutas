import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

const CLAVE_TOKEN   = 'ecorrutas_token';
const CLAVE_USUARIO = 'ecorrutas_usuario';

@Injectable({ providedIn: 'root' })
export class AuthServicio {

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((respuesta) => {
        localStorage.setItem(CLAVE_TOKEN,   respuesta.data.token);
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.data.user));
      })
    );
  }

  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.router.navigate(['/login']);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem(CLAVE_TOKEN);
  }

  obtenerUsuario(): any {
    const valor = localStorage.getItem(CLAVE_USUARIO);
    return valor ? JSON.parse(valor) : null;
  }

  /**
   * Solicita el envío de email para restablecer contraseña.
   */
  solicitarResetPassword(email: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Restablece la contraseña usando el token recibido por email.
   */
  resetearPassword(token: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, { token, password });
  }

  /**
   * Restablece la contraseña de un admin directamente verificando username.
   * Flujo simplificado sin emails ni tokens.
   */
  adminResetPassword(username: string, password: string) {
    const url = `${environment.apiUrl}/auth/admin-reset`;
    console.log(`[AuthService] Enviando POST a: ${url}`);

    return this.http.post<any>(url, { username, password })
      .pipe(
        tap(response => console.log('[AuthService] Respuesta recibida:', response)),
        catchError(err => {
          console.error('[AuthService] Error en request:', err);
          throw err;
        })
      );
  }
}
