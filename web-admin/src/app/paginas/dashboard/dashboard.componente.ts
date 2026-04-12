import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import {
  RouterOutlet, RouterLink, RouterLinkActive,
  Router, NavigationEnd, ActivatedRoute
} from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { AuthServicio }     from '../../servicios/auth.servicio';

interface ItemNav {
  etiqueta:      string;
  etiquetaCorta?: string; // texto corto para el bottom nav en móvil
  icono:         string;
  ruta:          string;
  badge?:        number;
  badgeAlerta?:  boolean;
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

  // ── Estado del sidebar en móvil ──
  sidebarAbierto = false;

  itemsNav: ItemNav[] = [
    {
      etiqueta: 'Inicio',
      etiquetaCorta: 'Inicio',
      icono: 'dashboard',
      ruta: '/dashboard/inicio',
    },
    {
      etiqueta: 'Vehículos',
      etiquetaCorta: 'Vehíc.',
      icono: 'local_shipping',
      ruta: '/dashboard/vehiculos',
      badge: 0,
      badgeAlerta: false,
    },
    {
      etiqueta: 'Conductores',
      etiquetaCorta: 'Conduc.',
      icono: 'people',
      ruta: '/dashboard/conductores',
      badge: 0,
    },
    {
      etiqueta: 'Rutas',
      etiquetaCorta: 'Rutas',
      icono: 'map',
      ruta: '/dashboard/rutas',
      badge: 0,
    },
    {
      etiqueta: 'Asignaciones',
      etiquetaCorta: 'Asigna.',
      icono: 'assignment',
      ruta: '/dashboard/asignaciones',
    },
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

    this.routerSub = this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.route.firstChild?.snapshot?.url[0]?.path),
      )
      .subscribe((rutaHija) => {
        this.actualizarSeccionDesdeRuta(rutaHija);
        // Cerrar sidebar al navegar en móvil
        this.sidebarAbierto = false;
      });
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  // ── Abrir / cerrar sidebar ──
  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebar(): void {
    this.sidebarAbierto = false;
  }

  // ── Cierra sidebar si la pantalla se agranda a desktop ──
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.sidebarAbierto = false;
    }
  }

  // ── Cierra sidebar con tecla Escape ──
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.sidebarAbierto = false;
  }

  // ── Sección actual desde la ruta ──
  actualizarSeccion(): void {
    const rutaHija = this.route.firstChild?.snapshot?.url[0]?.path;
    this.actualizarSeccionDesdeRuta(rutaHija);
  }

  private actualizarSeccionDesdeRuta(rutaHija: string | undefined): void {
    switch (rutaHija) {
      case 'inicio':       this.seccionActual = 'Inicio';       break;
      case 'vehiculos':    this.seccionActual = 'Vehículos';    break;
      case 'conductores':  this.seccionActual = 'Conductores';  break;
      case 'rutas':        this.seccionActual = 'Rutas';        break;
      case 'asignaciones': this.seccionActual = 'Asignaciones'; break;
      default:             this.seccionActual = 'Inicio';       break;
    }
    this.cdr.markForCheck();
  }

  get inicialesUsuario(): string {
    return this.nombreUsuario.slice(0, 2).toUpperCase();
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    });
  }
}