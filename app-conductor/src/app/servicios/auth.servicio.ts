import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthServicio {

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).subscribe({
        next: async (res) => {
          if (res.data?.token) {
            await Preferences.set({ key: 'ecorrutas_token', value: res.data.token });
            await Preferences.set({ key: 'ecorrutas_usuario', value: JSON.stringify(res.data.user) });
          }
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  async cerrarSesion(): Promise<void> {
    await Preferences.remove({ key: 'ecorrutas_token' });
    await Preferences.remove({ key: 'ecorrutas_usuario' });
    this.router.navigate(['/login']);
  }

  async obtenerToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'ecorrutas_token' });
    return value;
  }

  async estaAutenticado(): Promise<boolean> {
    const token = await this.obtenerToken();
    return !!token;
  }

  async obtenerUsuario(): Promise<any> {
    const { value } = await Preferences.get({ key: 'ecorrutas_usuario' });
    return value ? JSON.parse(value) : null;
  }
}
