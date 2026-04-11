import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthServicio } from '../../servicios/auth.servicio';

interface ItemNav {
  etiqueta: string;
  icono: string;
  ruta: string;
  badge?: number;
  badgeAlerta?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.componente.html',
  styleUrl:    './dashboard.componente.css',
})
export class DashboardComponente implements OnInit, OnDestroy {

  private routerSub!: Subscription;

  itemsNav: ItemNav[] = [
    { etiqueta: 'Inicio',       icono: 'dashboard',       ruta: '/dashboard/inicio'      },
    { etiqueta: 'Vehículos',    icono: 'local_shipping',  ruta: '/dashboard/vehiculos',   badge: 0, badgeAlerta: false },
    { etiqueta: 'Conductores',  icono: 'people',          ruta: '/dashboard/conductores', badge: 0 },
    { etiqueta: 'Rutas',        icono: 'map',             ruta: '/dashboard/rutas',       badge: 0 },
    { etiqueta: 'Asignaciones', icono: 'assignment',      ruta: '/dashboard/asignaciones' },
  ];

  nombreUsuario = '';
  seccionActual = 'Dashboard';

  constructor(
    public authServicio: AuthServicio,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const usuario = this.authServicio.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre ?? usuario?.username ?? 'Administrador';
    this.actualizarSeccion();

    // Suscribirse a eventos de navegación para actualizar título automáticamente
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.actualizarSeccion(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  actualizarSeccion(url?: string): void {
    const currentUrl = url || this.router.url;
    if (currentUrl.includes('vehiculos'))    this.seccionActual = 'Vehículos';
    else if (currentUrl.includes('conductores')) this.seccionActual = 'Conductores';
    else if (currentUrl.includes('rutas'))   this.seccionActual = 'Rutas';
    else if (currentUrl.includes('asignaciones')) this.seccionActual = 'Asignaciones';
    else if (currentUrl.includes('inicio'))    this.seccionActual = 'Inicio';
    else this.seccionActual = 'Dashboard';
  }

  get inicialesUsuario(): string {
    return this.nombreUsuario.slice(0, 2).toUpperCase();
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}