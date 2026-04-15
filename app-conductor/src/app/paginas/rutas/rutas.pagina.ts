import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  IonContent,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthServicio } from '../../servicios/auth.servicio';
import { environment } from '../../../environments/environment';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSpinner,
  ],
  template: `
    <ion-content [scrollY]="true" class="fondo">

      <!-- STATUS BAR SPACE -->
      <div class="hero">
        <div class="hero-top">
          <div class="hero-marca-wrap">
            <div class="hero-logo">
              <img src="assets/icon/logo.png" alt="Logo" class="hero-logo-img" />
            </div>
            <span class="hero-marca">EcoRutas</span>
          </div>
          <button class="hero-btn-logout" (click)="cerrarSesion()">
            <svg viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
        <p class="hero-saludo">Bienvenido de nuevo</p>
        <h1 class="hero-nombre">{{ nombreConductor }}</h1>
        <div class="hero-fecha">
          <svg viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
          </svg>
          {{ fechaHoy }} · {{ horaActual }}
        </div>
      </div>

      <div class="content">

        <!-- STATS -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-top">
              <span class="stat-lbl">Total hoy</span>
              <div class="stat-ico verde">
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              </div>
            </div>
            <span class="stat-num">{{ rutas.length }}</span>
            <span class="stat-sub">Rutas asignadas</span>
          </div>
          <div class="stat-card">
            <div class="stat-top">
              <span class="stat-lbl">Pendientes</span>
              <div class="stat-ico naranja">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
            </div>
            <span class="stat-num naranja-txt">{{ totalPendientes }}</span>
            <span class="stat-sub">Por iniciar</span>
          </div>
          <div class="stat-card">
            <div class="stat-top">
              <span class="stat-lbl">Completadas</span>
              <div class="stat-ico verde">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
            </div>
            <span class="stat-num">{{ totalCompletadas }}</span>
            <span class="stat-sub">Finalizadas</span>
          </div>
          <div class="stat-card">
            <div class="stat-top">
              <span class="stat-lbl">En curso</span>
              <div class="stat-ico azul">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <span class="stat-num azul-txt">{{ totalEnCurso }}</span>
            <span class="stat-sub">Activas</span>
          </div>
        </div>

        <!-- CARGANDO -->
        @if (cargando) {
          <div class="centro">
            <ion-spinner name="crescent" class="spinner-verde"></ion-spinner>
            <p class="cargando-txt">Cargando rutas...</p>
          </div>
        }

        <!-- SIN RUTAS -->
        @if (!cargando && rutas.length === 0) {
          <div class="vacio">
            <div class="vacio-ico">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
            </div>
            <p class="vacio-txt">No tienes rutas asignadas para hoy</p>
            <p class="vacio-sub">Consulta con tu administrador</p>
          </div>
        }

        <!-- LISTA DE RUTAS -->
        @if (!cargando && rutas.length > 0) {
          <div class="sec-header">
            <span class="sec-titulo">Rutas de hoy</span>
          </div>

          @for (ruta of rutas; track ruta.id) {
            <div class="ruta-card">
              <div class="ruta-top">
                <div class="ruta-info-wrap">
                  <div class="ruta-icono" [class.ruta-icono--gris]="ruta.estado === 'completada' || ruta.estado === 'cancelada'">
                    <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                  </div>
                  <div>
                    <p class="ruta-nombre">{{ ruta.ruta_nombre || 'Ruta ' + ruta.ruta_id }}</p>
                    <p class="ruta-meta">{{ formatearFecha(ruta.fecha) }}</p>
                  </div>
                </div>
                <span class="pill" [class]="'pill--' + ruta.estado">
                  <span class="pill-dot"></span>
                  {{ etiquetaEstado(ruta.estado) }}
                </span>
              </div>

              @if (ruta.estado === 'pendiente') {
                <button
                  class="btn-iniciar"
                  [disabled]="procesandoRecorrido || hayRecorridoEnCurso"
                  (click)="iniciarRecorrido(ruta)"
                >
                  @if (procesandoRecorrido) {
                    <ion-spinner name="crescent" class="btn-spinner"></ion-spinner>
                    Iniciando...
                  } @else if (hayRecorridoEnCurso) {
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    Ya tienes un recorrido activo
                  } @else {
                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Iniciar recorrido
                  }
                </button>
              }

              @if (ruta.estado === 'en_curso') {
                <button class="btn-ver-recorrido" (click)="verRecorrido()">
                  <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  Ver recorrido activo
                </button>
              }
            </div>
          }
        }

      </div>
    </ion-content>
  `,
  styles: [`
    .fondo { --background: #f0f4f0; }

    /* ── Hero ── */
    .hero {
      background: #1e8c34;
      padding: 48px 16px 28px;
      position: relative;
      overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: -20px; left: 0; right: 0;
      height: 40px;
      background: #f0f4f0;
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }
    .hero::before {
      content: '';
      position: absolute;
      width: 180px; height: 180px; border-radius: 50%;
      background: rgba(255,255,255,0.05);
      top: -60px; right: -30px;
    }
    .hero-top {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px; position: relative; z-index: 1;
    }
    .hero-marca-wrap { display: flex; align-items: center; gap: 8px; }
    .hero-logo {
      width: 32px; height: 32px; background: #fff;
      border-radius: 50%; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .hero-logo-img { width: 28px; height: 28px; object-fit: contain; border-radius: 50%; }
    .hero-marca { font-size: 0.85rem; font-weight: 900; color: #fff; }
    .hero-btn-logout {
      width: 34px; height: 34px;
      background: rgba(255,255,255,0.15);
      border: none; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    .hero-btn-logout svg { width: 16px; height: 16px; fill: #fff; }
    .hero-saludo {
      font-size: 0.65rem; color: rgba(255,255,255,0.7);
      text-transform: uppercase; letter-spacing: 1.5px;
      margin: 0 0 3px; position: relative; z-index: 1;
    }
    .hero-nombre {
      font-size: 1.3rem; font-weight: 900; color: #fff;
      margin: 0 0 6px; position: relative; z-index: 1;
    }
    .hero-fecha {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.68rem; color: rgba(255,255,255,0.75);
      position: relative; z-index: 1;
    }
    .hero-fecha svg { width: 12px; height: 12px; fill: rgba(255,255,255,0.75); }

    /* ── Content ── */
    .content { padding: 24px 14px 24px; display: flex; flex-direction: column; gap: 12px; }

    /* ── Stats ── */
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stat-card {
      background: #fff; border-radius: 12px;
      padding: 10px 12px; border: 1px solid #eee;
    }
    .stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .stat-lbl { font-size: 0.58rem; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.4px; }
    .stat-ico { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; }
    .stat-ico svg { width: 13px; height: 13px; }
    .stat-ico.verde { background: #e8f5e9; } .stat-ico.verde svg { fill: #1e8c34; }
    .stat-ico.naranja { background: #fff3e0; } .stat-ico.naranja svg { fill: #e65100; }
    .stat-ico.azul { background: #e3f2fd; } .stat-ico.azul svg { fill: #1565c0; }
    .stat-num { display: block; font-size: 1.4rem; font-weight: 900; color: #111; line-height: 1; }
    .stat-num.naranja-txt { color: #e65100; }
    .stat-num.azul-txt { color: #1565c0; }
    .stat-sub { font-size: 0.58rem; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 2px; display: block; }

    /* ── Cargando / Vacío ── */
    .centro { display: flex; flex-direction: column; align-items: center; padding: 2rem; gap: 10px; }
    .spinner-verde { --color: #1e8c34; }
    .cargando-txt { font-size: 0.82rem; color: #9e9e9e; }
    .vacio { display: flex; flex-direction: column; align-items: center; padding: 2rem; gap: 8px; }
    .vacio-ico { width: 60px; height: 60px; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .vacio-ico svg { width: 28px; height: 28px; fill: #1e8c34; }
    .vacio-txt { font-size: 0.88rem; font-weight: 700; color: #333; text-align: center; }
    .vacio-sub { font-size: 0.75rem; color: #9e9e9e; text-align: center; }

    /* ── Sección ── */
    .sec-header { display: flex; align-items: center; justify-content: space-between; }
    .sec-titulo { font-size: 0.72rem; font-weight: 900; color: #333; text-transform: uppercase; letter-spacing: 0.6px; }

    /* ── Ruta card ── */
    .ruta-card {
      background: #fff; border-radius: 14px;
      padding: 12px 14px; border: 1px solid #eee;
      display: flex; flex-direction: column; gap: 10px;
    }
    .ruta-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .ruta-info-wrap { display: flex; align-items: center; gap: 10px; }
    .ruta-icono {
      width: 36px; height: 36px; background: #e8f5e9;
      border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ruta-icono svg { width: 18px; height: 18px; fill: #1e8c34; }
    .ruta-icono--gris { background: #f5f5f5; }
    .ruta-icono--gris svg { fill: #9e9e9e; }
    .ruta-nombre { font-size: 0.88rem; font-weight: 900; color: #111; margin: 0 0 2px; }
    .ruta-meta { font-size: 0.65rem; color: #9e9e9e; margin: 0; }

    /* Pills */
    .pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 9px; border-radius: 20px; font-size: 0.6rem; font-weight: 700; flex-shrink: 0; }
    .pill-dot { width: 5px; height: 5px; border-radius: 50%; }
    .pill--pendiente { background: #e3f2fd; color: #1565c0; }
    .pill--pendiente .pill-dot { background: #1565c0; }
    .pill--en_curso { background: #fff3e0; color: #e65100; }
    .pill--en_curso .pill-dot { background: #e65100; }
    .pill--completada { background: #e8f5e9; color: #1e8c34; }
    .pill--completada .pill-dot { background: #1e8c34; }
    .pill--cancelada { background: #f5f5f5; color: #757575; }
    .pill--cancelada .pill-dot { background: #9e9e9e; }

    /* Botones */
    .btn-iniciar {
      width: 100%; height: 42px;
      background: #1e8c34; color: #fff; border: none;
      border-radius: 10px; font-size: 0.82rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      cursor: pointer; font-family: inherit;
      box-shadow: 0 3px 10px rgba(30,140,52,0.3);
    }
    .btn-iniciar:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-iniciar svg { width: 16px; height: 16px; fill: #fff; }
    .btn-spinner { --color: #fff; width: 16px; height: 16px; }

    .btn-ver-recorrido {
      width: 100%; height: 42px;
      background: #fff3e0; color: #e65100; border: 1.5px solid #ffcc80;
      border-radius: 10px; font-size: 0.82rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      cursor: pointer; font-family: inherit;
    }
    .btn-ver-recorrido svg { width: 16px; height: 16px; fill: #e65100; }
  `],
})
export class RutasPagina implements OnInit, OnDestroy {
  cargando = true;
  procesandoRecorrido = false;
  rutas: any[] = [];
  nombreConductor = '';
  horaActual = '';
  private intervaloHora: any;
  private intervaloRutas: any;
  private usuarioSubscription: Subscription | null = null;
  private conductorId: string | null = null;

  get totalPendientes()   { return this.rutas.filter(r => r.estado === 'pendiente').length; }
  get totalCompletadas()  { return this.rutas.filter(r => r.estado === 'completada').length; }
  get totalEnCurso()      { return this.rutas.filter(r => r.estado === 'en_curso').length; }
  get hayRecorridoEnCurso() { return this.rutas.some(r => r.estado === 'en_curso'); }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  }

  constructor(
    private authServicio: AuthServicio,
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
  ) {}

  async ngOnInit() {
    this.actualizarHora();
    this.intervaloHora = setInterval(() => this.actualizarHora(), 1000);

    // Suscribirse a cambios del usuario para actualizar automáticamente
    console.log('[Rutas] Suscribiéndose a cambios de usuario...');
    this.usuarioSubscription = this.authServicio.usuario$.subscribe(usuario => {
      console.log('[Rutas] Usuario actualizado en observable:', usuario?.nombre);
      if (usuario) {
        this.nombreConductor = usuario?.nombre ?? usuario?.username ?? 'Conductor';
        console.log('[Rutas] Nombre del conductor actualizado:', this.nombreConductor);
        this.conductorId = usuario.id;
        this.cargarRutasAsignadas(usuario.id);
      }
    });

    // Cargar usuario inicial y configurar sincronización de rutas
    const usuario = await this.authServicio.obtenerUsuario();
    if (usuario?.id) {
      this.conductorId = usuario.id;
      this.nombreConductor = usuario?.nombre ?? usuario?.username ?? 'Conductor';
      // Las rutas ya se cargan por la suscripción a usuario$, no es necesario llamar aquí

      // Iniciar sincronización automática de rutas cada 5 segundos
      console.log('[Rutas] Iniciando sincronización automática de rutas cada 5s');
      this.intervaloRutas = interval(5000).subscribe(() => {
        if (this.conductorId) {
          console.log('[Rutas] Sincronizando rutas...');
          this.cargarRutasAsignadas(this.conductorId);
        }
      });
    } else {
      this.cargando = false;
    }
  }

  ngOnDestroy() {
    if (this.intervaloHora) clearInterval(this.intervaloHora);
    if (this.intervaloRutas) {
      console.log('[Rutas] Deteniendo sincronización de rutas');
      this.intervaloRutas.unsubscribe();
    }
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  actualizarHora() {
    this.horaActual = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  cargarRutasAsignadas(conductorId: string) {
    if (!conductorId) return;
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/asignaciones/conductor/${conductorId}`).subscribe({
      next: (res) => {
        this.rutas = res.data || [];
        this.cargando = false;
      },
      error: async (err) => {
        this.cargando = false;
        await this.mostrarError(err?.error?.message || 'Error al cargar rutas asignadas');
      },
    });
  }

  iniciarRecorrido(ruta: any) {
    if (this.procesandoRecorrido || this.hayRecorridoEnCurso) return;
    this.procesandoRecorrido = true;

    this.http.post<any>(`${environment.apiUrl}/recorridos/iniciar`, {}).subscribe({
      next: (res) => {
        this.procesandoRecorrido = false;
        const recorrido = res.data;
        if (recorrido?.id) {
          this.router.navigate(['/recorrido', recorrido.id]);
        }
      },
      error: async (err) => {
        this.procesandoRecorrido = false;
        await this.mostrarError(err?.error?.message || 'No se pudo iniciar el recorrido.');
      },
    });
  }

  verRecorrido() {
    this.router.navigate(['/recorrido', 'activo']);
  }

  async cerrarSesion() {
    await this.authServicio.cerrarSesion();
  }

  etiquetaEstado(estado: string): string {
    return { pendiente: 'Pendiente', en_curso: 'En curso', completada: 'Completada', cancelada: 'Cancelada' }[estado] ?? estado;
  }

  formatearFecha(fechaIso: string): string {
    if (!fechaIso) return '';
    try {
      const p = fechaIso.split('T')[0].split('-');
      return `${p[2]}/${p[1]}/${p[0]}`;
    } catch { return fechaIso; }
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje, duration: 4000, color: 'danger', position: 'bottom',
    });
    await toast.present();
  }
}