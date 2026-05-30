import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient }   from '@angular/common/http';
import { Router }       from '@angular/router';
import { MatIconModule }             from '@angular/material/icon';
import { MatProgressSpinnerModule }  from '@angular/material/progress-spinner';
import { AuthServicio }  from '../../servicios/auth.servicio';
import { environment }   from '../../../environments/environment';

interface ResumenDashboard {
  recorridos_en_curso: number;
  completadas_hoy: number;
  vehiculos_operativos: number;
  fotos_hoy: number;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './inicio.componente.html',
  styleUrls:   ['./inicio.componente.css'],
})
export class InicioComponente implements OnInit {

  nombreUsuario = '';
  cargando = true;
  private pollInterval: any;

  resumen: ResumenDashboard = {
    recorridos_en_curso: 0,
    completadas_hoy: 0,
    vehiculos_operativos: 0,
    fotos_hoy: 0,
  };


  constructor(
    private http:         HttpClient,
    private router:       Router,
    private authServicio: AuthServicio,
    private cdr:          ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const usuario = this.authServicio.obtenerUsuario();
    this.nombreUsuario = usuario?.nombre ?? usuario?.username ?? 'Administrador';
    this.cargarResumen();
    this.pollInterval = setInterval(() => this.cargarResumen(), 20000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  cargarResumen(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    this.http.get<any>(`${environment.apiUrl}/dashboard`).subscribe({
      next: (res) => {
        if (res.data) {
          this.resumen = {
            recorridos_en_curso: res.data.recorridos_en_curso || 0,
            completadas_hoy: res.data.completadas_hoy || 0,
            vehiculos_operativos: res.data.vehiculos_operativos || 0,
            fotos_hoy: res.data.fotos_hoy || 0
          };
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  /* ── Helpers para las gráficas donut ── */

  /** Porcentaje redondeado, seguro contra división por cero */
  getPct(valor: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((valor / total) * 100);
  }

  /**
   * stroke-dasharray para el círculo SVG.
   * Circunferencia con r=30: 2 * π * 30 ≈ 188.4
   */
  getDashArray(valor: number, total: number): string {
    const circ = 188.4;
    const pct  = this.getPct(valor, total) / 100;
    const fill = Math.round(circ * pct * 10) / 10;
    return `${fill} ${circ}`;
  }

  get saludo(): string {
    const h = new Date().getHours();
    if (h < 12) return '¡Buenos días';
    if (h < 18) return '¡Buenas tardes';
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