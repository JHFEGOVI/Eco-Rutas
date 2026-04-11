import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthServicio } from '../../servicios/auth.servicio';

interface ItemNav {
  etiqueta: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-sidenav-container class="contenedor-app">

      <!-- Barra lateral -->
      <mat-sidenav mode="side" opened class="barra-lateral">
        <div class="barra-lateral__cabecera">
          <h2 class="barra-lateral__titulo">EcoRutas</h2>
        </div>

        <mat-nav-list>
          @for (item of itemsNav; track item.ruta) {
            <a
              mat-list-item
              [routerLink]="item.ruta"
              routerLinkActive="activo"
              [routerLinkActiveOptions]="{ exact: false }"
            >
              <span class="item-nav">
                <span class="item-nav__icono">{{ item.icono }}</span>
                {{ item.etiqueta }}
              </span>
            </a>
          }
        </mat-nav-list>

        <div class="barra-lateral__pie">
          <button mat-stroked-button class="boton-sesion" (click)="authServicio.cerrarSesion()">
            Cerrar sesión
          </button>
        </div>
      </mat-sidenav>

      <!-- Contenido principal -->
      <mat-sidenav-content class="contenido">

        <!-- Barra superior -->
        <mat-toolbar class="barra-superior" color="primary">
          <span class="barra-superior__titulo">{{ tituloSeccion }}</span>
          <span class="espaciador"></span>
          <span class="barra-superior__usuario">{{ nombreUsuario }}</span>
        </mat-toolbar>

        <!-- Área de contenido -->
        <main class="zona-contenido">
          <router-outlet></router-outlet>
        </main>

      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .contenedor-app {
      height: 100vh;
    }

    /* ── Barra lateral ── */
    .barra-lateral {
      width: 260px;
      background: linear-gradient(180deg, var(--brand-green) 0%, var(--brand-green-dark) 100%);
      display: flex;
      flex-direction: column;
      color: white;
    }

    .barra-lateral__cabecera {
      padding: 24px 16px 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .barra-lateral__titulo {
      color: #ffffff;
      font-size: 1.4rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: 0.4px;
    }

    /* Ítems de navegación */
    mat-nav-list a {
      color: rgba(255, 255, 255, 0.92);
      border-radius: 8px;
      margin: 6px 12px;
      padding: 8px 10px;
      display: block;
    }

    mat-nav-list a:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.06);
      transform: translateX(2px);
    }

    mat-nav-list a.activo {
      color: var(--brand-green-dark);
      background-color: rgba(255,255,255,0.9);
      font-weight: 700;
    }

    .item-nav {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .item-nav__icono {
      font-size: 1.1rem;
    }

    /* Botón cerrar sesión al pie */
    .barra-lateral__pie {
      margin-top: auto;
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .boton-sesion {
      width: 100%;
      color: var(--brand-green-dark);
      background: white;
      border-color: rgba(255,255,255,0.15);
    }

    .boton-sesion:hover {
      background: #ffffff;
      transform: translateY(-1px);
    }

    /* ── Barra superior ── */
    .barra-superior {
      position: sticky;
      top: 0;
      z-index: 10;
      background: white;
      color: var(--brand-green-dark);
      box-shadow: 0 1px 6px rgba(16,24,32,0.06);
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }

    .barra-superior__titulo {
      font-size: 1.1rem;
      font-weight: 500;
    }

    .espaciador {
      flex: 1;
    }

    .barra-superior__usuario {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    /* ── Zona de contenido ── */
    .contenido {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .zona-contenido {
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: linear-gradient(180deg, #f8fbf9 0%, #ffffff 100%);
    }
  `],
})
export class DashboardComponente implements OnInit {

  itemsNav: ItemNav[] = [
    { etiqueta: 'Vehículos',    icono: '🚛', ruta: '/dashboard/vehiculos'   },
    { etiqueta: 'Conductores',  icono: '👤', ruta: '/dashboard/conductores' },
    { etiqueta: 'Rutas',        icono: '🗺️', ruta: '/dashboard/rutas'       },
    { etiqueta: 'Asignaciones', icono: '📋', ruta: '/dashboard/asignaciones'},
  ];

  tituloSeccion = 'Panel de administración';
  nombreUsuario = '';

  constructor(public authServicio: AuthServicio) {}

  ngOnInit(): void {
    const usuario = this.authServicio.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre ?? usuario?.username ?? '';
  }
}
