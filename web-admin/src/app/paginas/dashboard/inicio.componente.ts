import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthServicio } from '../../servicios/auth.servicio';
import { environment } from '../../../environments/environment';

interface ResumenDashboard {
  totalVehiculos: number;
  vehiculosOperativos: number;
  vehiculosAveriados: number;
  totalConductores: number;
  conductoresActivos: number;
  totalRutas: number;
  totalAsignaciones: number;
  asignacionesPendientes: number;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './inicio.componente.html',
  styleUrls:    ['./inicio.componente.css'],
})
export class InicioComponente implements OnInit {

  nombreUsuario = '';
  cargando = true;

  resumen: ResumenDashboard = {
    totalVehiculos: 0,
    vehiculosOperativos: 0,
    vehiculosAveriados: 0,
    totalConductores: 0,
    conductoresActivos: 0,
    totalRutas: 0,
    totalAsignaciones: 0,
    asignacionesPendientes: 0,
  };

  actividadReciente: { texto: string; tiempo: string; tipo: 'exito' | 'alerta' | 'info' }[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private authServicio: AuthServicio,
  ) {}

  ngOnInit(): void {
    const usuario = this.authServicio.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre ?? usuario?.username ?? 'Administrador';
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;

    // Carga en paralelo vehículos, conductores, rutas y asignaciones
    Promise.all([
      this.http.get<any>(`${environment.apiUrl}/vehiculos`).toPromise().catch(() => ({ data: [] })),
      this.http.get<any>(`${environment.apiUrl}/usuarios`).toPromise().catch(() => ({ data: [] })),
      this.http.get<any>(`${environment.apiUrl}/rutas`).toPromise().catch(() => ({ data: [] })),
      this.http.get<any>(`${environment.apiUrl}/asignaciones`).toPromise().catch(() => ({ data: [] })),
    ]).then(([vehiculos, conductores, rutas, asignaciones]) => {
      const v = vehiculos?.data ?? [];
      const c = conductores?.data ?? [];
      const r = rutas?.data ?? [];
      const a = asignaciones?.data ?? [];

      this.resumen = {
        totalVehiculos:        v.length,
        vehiculosOperativos:   v.filter((x: any) => x.estado === 'operativo').length,
        vehiculosAveriados:    v.filter((x: any) => x.estado === 'averiado').length,
        totalConductores:      c.length,
        conductoresActivos:    c.filter((x: any) => x.activo).length,
        totalRutas:            r.length,
        totalAsignaciones:     a.length,
        asignacionesPendientes: a.filter((x: any) => x.estado === 'pendiente').length,
      };

      this.cargando = false;
    });
  }

  get saludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }
}