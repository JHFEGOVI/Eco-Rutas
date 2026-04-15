import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthServicio {
  private usuarioSubject = new BehaviorSubject<any>(null);
  public usuario$ = this.usuarioSubject.asObservable();
  private syncSubscription: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.inicializarUsuario();
  }

  private async inicializarUsuario(): Promise<void> {
    const usuario = await this.obtenerUsuario();
    console.log('[Auth] Usuario inicializado:', usuario?.nombre);
    this.usuarioSubject.next(usuario);
  }

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).subscribe({
        next: async (res) => {
          if (res.data?.token) {
            await Preferences.set({ key: 'ecorrutas_token', value: res.data.token });
            await Preferences.set({ key: 'ecorrutas_usuario', value: JSON.stringify(res.data.user) });
            this.usuarioSubject.next(res.data.user);
          }
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  async cerrarSesion(): Promise<void> {
    this.detenerSincronizacion();
    this.usuarioSubject.next(null);
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

  /**
   * Sincroniza los datos del usuario con el backend
   * Útil para actualizar datos cuando el admin modifica el usuario
   */
  async sincronizarUsuario(): Promise<void> {
    const token = await this.obtenerToken();
    if (!token) {
      console.log('[Auth] No hay token, omitiendo sincronización');
      return;
    }

    try {
      console.log('[Auth] Sincronizando usuario...');
      const response: any = await this.http.get(`${environment.apiUrl}/auth/me`).toPromise();
      if (response.data) {
        const usuarioActualizado = response.data;
        const usuarioActual = await this.obtenerUsuario();

        // Solo actualizar si hay cambios reales
        if (JSON.stringify(usuarioActual) !== JSON.stringify(usuarioActualizado)) {
          console.log('[Auth] Cambios detectados, actualizando usuario:', usuarioActualizado.nombre);
          await Preferences.set({ key: 'ecorrutas_usuario', value: JSON.stringify(usuarioActualizado) });
          this.usuarioSubject.next(usuarioActualizado);
        } else {
          console.log('[Auth] Sin cambios en el usuario');
        }
      }
    } catch (error) {
      console.error('[Auth] Error al sincronizar usuario:', error);
    }
  }

  /**
   * Inicia la sincronización automática cada X segundos
   * @param intervaloSegundos - Tiempo entre sincronizaciones (default: 30 segundos)
   */
  iniciarSincronizacionAutomatica(intervaloSegundos: number = 30): void {
    // Prevenir múltiples intervalos
    if (this.syncSubscription) {
      console.log('[Auth] Sincronización ya activa, reiniciando...');
      this.syncSubscription.unsubscribe();
    }

    console.log(`[Auth] Iniciando sincronización automática cada ${intervaloSegundos}s`);

    // Ejecutar inmediatamente la primera vez
    this.sincronizarUsuario();

    this.syncSubscription = interval(intervaloSegundos * 1000).subscribe(async () => {
      await this.sincronizarUsuario();
    });
  }

  /**
   * Detiene la sincronización automática
   */
  detenerSincronizacion(): void {
    if (this.syncSubscription) {
      console.log('[Auth] Deteniendo sincronización automática');
      this.syncSubscription.unsubscribe();
      this.syncSubscription = null;
    }
  }
}
