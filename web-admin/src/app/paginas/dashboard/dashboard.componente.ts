import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
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
export class DashboardComponente implements OnInit {

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
  }

  actualizarSeccion(): void {
    const url = this.router.url;
    if (url.includes('vehiculos'))    this.seccionActual = 'Vehículos';
    else if (url.includes('conductores')) this.seccionActual = 'Conductores';
    else if (url.includes('rutas'))   this.seccionActual = 'Rutas';
    else if (url.includes('asignaciones')) this.seccionActual = 'Asignaciones';
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