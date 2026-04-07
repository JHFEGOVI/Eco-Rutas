import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
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
}
