import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthServicio } from './servicios/auth.servicio';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `
})
export class AppComponent implements OnInit {
  private authServicio = inject(AuthServicio);

  async ngOnInit(): Promise<void> {
    console.log('[App] Iniciando aplicación...');

    // Iniciar sincronización automática cada 1 segundos (para pruebas)
    // para detectar cambios hechos por el admin
    const autenticado = await this.authServicio.estaAutenticado();
    console.log('[App] Usuario autenticado:', autenticado);

    if (autenticado) {
      console.log('[App] Iniciando sincronización automática...');
      this.authServicio.iniciarSincronizacionAutomatica(); // 1 segundos
    } else {
      console.log('[App] Usuario no autenticado, sincronización no iniciada');
    }
  }
}
