import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
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
  styleUrls: ['./dashboard.componente.css'],
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
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const usuario = this.authServicio.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre ?? usuario?.username ?? 'Administrador';
    this.actualizarSeccion();

    // Suscribirse a eventos de navegación para actualizar título automáticamente
    this.routerSub = this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.route.firstChild?.snapshot?.url[0]?.path)
      )
      .subscribe((rutaHija) => {
        this.actualizarSeccionDesdeRuta(rutaHija);
      });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  actualizarSeccion(): void {
    const rutaHija = this.route.firstChild?.snapshot?.url[0]?.path;
    this.actualizarSeccionDesdeRuta(rutaHija);
  }

  private actualizarSeccionDesdeRuta(rutaHija: string | undefined): void {
    switch (rutaHija) {
      case 'inicio':       this.seccionActual = 'Inicio'; break;
      case 'vehiculos':    this.seccionActual = 'Vehículos'; break;
      case 'conductores':  this.seccionActual = 'Conductores'; break;
      case 'rutas':        this.seccionActual = 'Rutas'; break;
      case 'asignaciones': this.seccionActual = 'Asignaciones'; break;
      default:             this.seccionActual = 'Inicio'; break;
    }
    this.cdr.markForCheck();
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