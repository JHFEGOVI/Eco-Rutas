import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketServicio implements OnDestroy {
  private socket: Socket;

  constructor() {
    // Derivar la URL base quitando el prefijo /api
    const urlBase = environment.apiUrl.replace('/api', '');
    this.socket = io(urlBase, {
      transports: ['websocket'],
      autoConnect: true
    });
  }

  /** Retorna un Observable que emite cada vez que llega el evento indicado. */
  escucharEvento<T = any>(evento: string): Observable<T> {
    return new Observable<T>(observer => {
      this.socket.on(evento, (datos: T) => observer.next(datos));
      // Al desuscribirse, quitar el listener para no acumular handlers
      return () => this.socket.off(evento);
    });
  }

  /** Desconecta el socket del servidor. */
  desconectar(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.desconectar();
  }
}
