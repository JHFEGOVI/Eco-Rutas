import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { ConfirmarDialogo } from '../../compartido/confirmar.dialogo';
import * as L from 'leaflet';

export interface Ruta {
  id: string;
  nombre: string;
  descripcion: string;
  geometria: any;
  activa: boolean;
}

@Component({
  selector: 'app-rutas',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="layout-rutas" [class.movil]="esCelular">

      <!-- PANEL IZQUIERDO — lista de rutas -->
      <div class="panel-izquierdo mat-elevation-z2">
        <div class="cabecera">
          <h2 class="titulo">Rutas</h2>
          <button class="btn-nueva-ruta" (click)="activarNuevaRuta()">
            <mat-icon>add</mat-icon>
            <span>Nueva ruta</span>
          </button>
        </div>

        @if (cargando) {
          <div class="centro">
            <mat-spinner diameter="32"></mat-spinner>
          </div>
        } @else {
          <div class="lista-rutas">
            @for (r of rutas; track r.id) {
              <div
                class="item-ruta"
                [ngClass]="{'seleccionada': rutaSeleccionada?.id === r.id}"
                (click)="seleccionarRuta(r)"
              >
                <div class="info">
                  <span class="nombre">{{ r.nombre }}</span>
                </div>
                <div class="acciones">
                  <button class="accion-btn editar" title="Editar" (click)="editarRuta(r, $event)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button class="accion-btn eliminar" title="Desactivar" (click)="confirmarDesactivar(r, $event)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            }
            @if (rutas.length === 0) {
              <div class="sin-datos">No hay rutas registradas.</div>
            }
          </div>
        }
      </div>

      <!-- PANEL DERECHO — mapa -->
      <div class="panel-derecho">
        <div #contenedorMapa class="contenedor-mapa"></div>

        @if (modoEdicion) {
          <div class="panel-edicion mat-elevation-z4">
            <div class="dialogo-cabecera">
              <div class="dialogo-cabecera-icono"><mat-icon>map</mat-icon></div>
              <div class="dialogo-cabecera-texto">
                <h3 class="dialogo-titulo">{{ rutaSeleccionada ? 'Editar ruta' : 'Nueva ruta' }}</h3>
                <p class="dialogo-subtitulo">Define el trazado de la ruta y sus detalles</p>
              </div>
            </div>

            <form [formGroup]="formulario" class="form-edicion">
              <div class="campo-grupo">
                <label class="campo-label">Nombre</label>
                <div class="campo-wrap">
                  <mat-icon class="campo-icono">timeline</mat-icon>
                  <input class="campo-input" type="text" formControlName="nombre" placeholder="Nombre de ruta" />
                </div>
              </div>

              <div class="campo-grupo">
                <label class="campo-label">Descripción</label>
                <div class="campo-wrap area">
                  <mat-icon class="campo-icono">description</mat-icon>
                  <textarea class="campo-input campo-textarea" formControlName="descripcion" rows="2" placeholder="Detalles"></textarea>
                </div>
              </div>

              <div class="botones-edicion">
                <div class="botones-row">
                  <button type="button" class="btn-cancelar" (click)="deshacerUltimoPunto()" [disabled]="puntosRuta.length === 0">
                    <mat-icon>undo</mat-icon> Deshacer
                  </button>
                  <div class="espaciador"></div>
                  <button type="button" class="btn-cancelar" (click)="cancelar()">Cancelar</button>
                </div>

                <button type="button" class="btn-guardar btn-guardar--full" (click)="guardarRuta()" [disabled]="formulario.invalid || puntosRuta.length < 2">
                  <mat-icon>check</mat-icon> Guardar
                </button>
              </div>
            </form>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    /* ── Host ── */
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    /* ════════════════════════════════
       LAYOUT PRINCIPAL — Desktop
    ════════════════════════════════ */
    .layout-rutas {
      display: flex;
      height: 100%;
      min-height: 0;
      gap: 16px;
    }

    /* ── Panel izquierdo ── */
    .panel-izquierdo {
      width: 280px;
      min-width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
    }

    .cabecera {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid #eee;
      flex-shrink: 0;
    }

    .cabecera .btn-nueva-ruta {
      display: inline-flex; align-items: center; gap:8px; padding:8px 12px; border-radius:8px; background:#1e8c34; color:#fff; border:none; cursor:pointer; font-weight:700;
      box-shadow: 0 6px 18px rgba(30,140,52,0.14);
    }
    .cabecera .btn-nueva-ruta mat-icon { font-size:18px; }

    .titulo {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a3d1c;
    }

    .centro {
      display: flex;
      justify-content: center;
      padding: 32px;
    }

    .lista-rutas {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .item-ruta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: none;
      cursor: pointer;
      transition: background 0.18s, box-shadow 0.18s, transform 0.06s;
      min-height: 48px; /* área táctil mínima */
      background: #fff;
      border-radius: 8px;
      margin: 8px 12px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.04);
    }

    .item-ruta:hover { background: #fbfff9; box-shadow: 0 4px 18px rgba(0,0,0,0.06); transform: translateY(-1px); }

    .item-ruta.seleccionada {
      background: #eaf8ee;
      border-left: 4px solid #1e8c34;
      padding-left: 12px;
      box-shadow: 0 6px 20px rgba(30,140,52,0.06);
    }

    .info {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-weight: 600;
      color: #333;
      font-size: 0.88rem;
    }

    .acciones {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      align-items: center;
    }

    .accion-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      transition: background 0.12s, transform 0.06s;
    }
    .accion-btn mat-icon { font-size:18px; color:#111; }
    .accion-btn.editar:hover { background: rgba(30,140,52,0.06); }
    .accion-btn.eliminar:hover { background: rgba(198,40,40,0.06); }

    .sin-datos {
      padding: 24px;
      text-align: center;
      color: #9e9e9e;
      font-size: 0.85rem;
    }

    /* ── Panel derecho (mapa) ── */
    .panel-derecho {
      flex: 1;
      min-width: 0;
      min-height: 0;
      border-radius: 12px;
      overflow: hidden;
      background: #f0f0f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
      /* CRÍTICO: mapa necesita altura explícita en el padre */
      display: flex;
      flex-direction: column;
    }

    /* CRÍTICO: el mapa llena todo el panel */
    .contenedor-mapa {
      flex: 1;
      width: 100%;
      min-height: 0;
      /* Leaflet necesita estas propiedades */
      position: relative;
      z-index: 1;
    }

    /* ── Panel de edición flotante (estilo diálogo compacto) ── */
    .panel-edicion {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1000;
      background: #fff;
      border-radius: 12px;
      padding: 12px;
      width: 300px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.12);
      overflow: hidden;
    }

    .dialogo-cabecera {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #1e8c34;
      padding: 12px;
      margin: -12px -12px 10px -12px;
      border-radius: 10px 10px 6px 6px;
      color: #fff;
    }

    .dialogo-cabecera-icono {
      width: 52px; height: 52px; border-radius: 12px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.14);
    }
    .dialogo-cabecera-icono mat-icon { color: #fff; font-size:22px !important; }
    .dialogo-titulo { margin:0; font-weight:900; font-size:1.05rem; }
    .dialogo-subtitulo { margin:0; font-size:0.72rem; opacity:0.95; }

    .form-edicion { display:flex; flex-direction:column; gap:8px; }

    .campo-grupo { display:flex; flex-direction:column; gap:6px; }
    .campo-label { font-size:0.65rem; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.8px; }

    .campo-wrap { position: relative; display:flex; align-items:center; }
    .campo-icono { position:absolute; left:12px; color:#98a98f; font-size:14px !important; }
    .campo-input { width:100%; height:38px; padding:0 12px 0 40px; border:1.5px solid #e6f3ea; border-radius:10px; background:#fff; font-size:0.86rem; color:#333; }
    .campo-textarea { min-height:72px; padding:10px 12px 10px 40px; border:1.5px solid #e6f3ea; border-radius:10px; background:#fff; resize:vertical; }
    .campo-input::placeholder, .campo-textarea::placeholder { color:#cfcfcf; }
    .campo-input:focus, .campo-textarea:focus { border-color:#c9efcf; box-shadow:0 6px 18px rgba(30,140,52,0.08); outline:none; }

    .botones-edicion { display:flex; flex-direction:column; gap:10px; margin-top:6px; }
    .botones-row { display:flex; gap:10px; align-items:center; }
    .espaciador { flex:1; }

    .btn-cancelar { display:inline-flex; align-items:center; gap:8px; padding:10px 14px; background:#fff; border:1.5px solid #e6e6e6; border-radius:10px; font-weight:700; color:#222; }
    .btn-cancelar[disabled] { opacity:0.6; }

    .btn-secondary { background:#fff; border:1.5px solid #000; color:#111; padding:10px 14px; border-radius:10px; font-weight:700; }

    .btn-guardar { display:inline-flex; align-items:center; gap:10px; padding:12px 16px; background:#9fd3b1; color:#fff; border-radius:12px; font-weight:800; border:none; box-shadow:0 10px 24px rgba(30,140,52,0.12); }
    .btn-guardar mat-icon { font-size:18px; }
    .btn-guardar--full { width:100%; justify-content:center; }
    .btn-guardar:disabled { opacity:0.6; cursor:not-allowed; }

    /* ════════════════════════════════
       RESPONSIVE — MÓVIL ≤ 768px
    ════════════════════════════════ */
    @media (max-width: 768px) {

      /* Apila lista arriba, mapa abajo */
      .layout-rutas {
        flex-direction: column;
        height: auto;
        gap: 10px;
      }

      /* Lista compacta con scroll */
      .panel-izquierdo {
        width: 100%;
        min-width: unset;
        max-height: 200px;
        min-height: 120px;
        flex-shrink: 0;
        border-radius: 10px;
      }

      .cabecera {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
      }

      .titulo { font-size: 1rem; }

      .lista-rutas { max-height: 120px; }

      /* Mapa con altura fija en móvil */
      .panel-derecho {
        width: 100%;
        border-radius: 10px;
        /* Altura fija para que Leaflet pueda calcularse */
        height: 55vw;
        min-height: 260px;
        max-height: 440px;
        flex-shrink: 0;
      }

      /* Panel de edición ocupa todo el ancho en móvil */
      .panel-edicion {
        width: calc(100% - 20px);
        left: 10px;
        right: 10px;
        top: 10px;
      }
    }

    @media (max-width: 400px) {
      .panel-izquierdo { max-height: 170px; }
      .lista-rutas { max-height: 100px; }

      .panel-derecho {
        height: 60vw;
        min-height: 220px;
      }
    }
  `]
})
export class RutasComponente implements OnInit, AfterViewInit {

  @ViewChild('contenedorMapa', { static: true }) contenedorMapa!: ElementRef;

  cargando        = false;
  rutas: Ruta[]   = [];
  rutaSeleccionada: Ruta | null = null;
  modoEdicion     = false;
  formulario!: FormGroup;
  puntosRuta: number[][] = [];
  esCelular       = false;

  private map!: L.Map;
  private polyline!: L.Polyline;
  private marcadores: L.Marker[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cd: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      nombre:      ['', Validators.required],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.verificarCelular();
    this.cargarRutas();
  }

  /* ── Detectar si es móvil ── */
  @HostListener('window:resize')
  verificarCelular(): void {
    this.esCelular = window.innerWidth <= 768;
    // Re-calcular tamaño del mapa al girar pantalla
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 150);
    }
  }

  cargarRutas(): void {
    this.cargando = true;
    this.cd.detectChanges();
    this.http.get<any>(`${environment.apiUrl}/rutas`).subscribe({
      next: (res) => {
        this.rutas = res.data;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar las rutas');
        this.cargando = false;
        this.cd.detectChanges();
      },
    });
  }

  ngAfterViewInit(): void {
    const iconoDefault = L.icon({
      iconUrl:   'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize:  [25, 41],
      iconAnchor:[12, 41],
    });
    L.Marker.prototype.options.icon = iconoDefault;

    const limitesBuenaventura = L.latLngBounds(
      L.latLng(3.8000, -77.1000),
      L.latLng(3.9300, -76.9500),
    );

    this.map = L.map(this.contenedorMapa.nativeElement, {
      maxBounds:            limitesBuenaventura,
      maxBoundsViscosity:   1.0,
      minZoom:              13,
      /* Habilitar gestos táctiles en móvil */
      dragging:             true,
      touchZoom:            true,
      scrollWheelZoom:      true,
    }).setView([3.8801, -77.0311], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom:     20,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.polyline = L.polyline([], { color: '#1e8c34', weight: 4 }).addTo(this.map);

    /* CRÍTICO: invalidateSize le dice a Leaflet el tamaño real del contenedor.
       Sin esto el mapa aparece gris o cortado, especialmente en móvil. */
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);

    /* Segundo invalidate por si el layout tarda en renderizar */
    setTimeout(() => {
      this.map.invalidateSize();
    }, 600);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.modoEdicion) return;
      if (this.formulario.get('nombre')?.invalid) {
        this.mostrarError('Escribe el nombre de la ruta antes de trazar puntos.');
        return;
      }
      this.puntosRuta.push([e.latlng.lat, e.latlng.lng]);
      this.dibujarPuntosMapa();
      this.cd.detectChanges();
    });
  }

  private dibujarPuntosMapa(): void {
    this.limpiarCapasTemporales();
    this.puntosRuta.forEach((pt) => {
      const marcador = L.marker([pt[0], pt[1]]).addTo(this.map);
      this.marcadores.push(marcador);
    });
    this.polyline.setLatLngs(this.puntosRuta as L.LatLngExpression[]);
  }

  private limpiarCapasTemporales(): void {
    this.marcadores.forEach(m => m.remove());
    this.marcadores = [];
    if (this.polyline) this.polyline.setLatLngs([]);
  }

  private extraerCoordenadasGeoJSON(geometria: any): number[][] {
    if (geometria?.type === 'LineString' && Array.isArray(geometria.coordinates)) {
      return geometria.coordinates.map((c: number[]) => [c[1], c[0]]);
    }
    return [];
  }

  activarNuevaRuta(): void {
    this.limpiarCapasTemporales();
    this.modoEdicion     = true;
    this.puntosRuta      = [];
    this.rutaSeleccionada = null;
    this.formulario.reset();
    /* En móvil: hacer scroll al mapa para que sea visible */
    if (this.esCelular) {
      setTimeout(() => {
        this.contenedorMapa.nativeElement
            .closest('.panel-derecho')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.map.invalidateSize();
      }, 150);
    }
  }

  activarEdicion(ruta: Ruta): void {
    this.formulario.patchValue({
      nombre:      ruta.nombre,
      descripcion: ruta.descripcion,
    });
    this.puntosRuta = this.extraerCoordenadasGeoJSON(ruta.geometria);
    this.dibujarPuntosMapa();
    if (this.puntosRuta.length > 0) {
      this.map.fitBounds(this.polyline.getBounds(), { padding: [20, 20] });
    }
    this.modoEdicion = true;
  }

  deshacerUltimoPunto(): void {
    if (this.puntosRuta.length > 0) {
      this.puntosRuta.pop();
      this.dibujarPuntosMapa();
    }
  }

  seleccionarRuta(ruta: Ruta): void {
    // Toggle selection: si ya está seleccionada, quitar selección
    if (this.rutaSeleccionada?.id === ruta.id) {
      this.rutaSeleccionada = null;
      this.modoEdicion = false;
      this.puntosRuta = [];
      this.limpiarCapasTemporales();
      this.cd.detectChanges();
      return;
    }

    this.modoEdicion      = false;
    this.rutaSeleccionada = ruta;
    this.limpiarCapasTemporales();
    this.puntosRuta = this.extraerCoordenadasGeoJSON(ruta.geometria);
    this.polyline.setLatLngs(this.puntosRuta as L.LatLngExpression[]);
    if (this.puntosRuta.length > 0) {
      this.map.fitBounds(this.polyline.getBounds(), { padding: [20, 20] });
    }
    /* En móvil: mostrar mapa al seleccionar ruta */
    if (this.esCelular) {
      setTimeout(() => {
        this.contenedorMapa.nativeElement
            .closest('.panel-derecho')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.map.invalidateSize();
      }, 150);
    }
  }

  editarRuta(ruta: Ruta, evento: Event): void {
    evento.stopPropagation();
    this.rutaSeleccionada = ruta;
    this.activarEdicion(ruta);
  }

  guardarRuta(): void {
    if (this.formulario.invalid || this.puntosRuta.length < 2) return;

    const body = {
      nombre:      this.formulario.value.nombre,
      descripcion: this.formulario.value.descripcion,
      geometria: {
        type:        'LineString',
        coordinates: this.puntosRuta.map(p => [p[1], p[0]]),
      },
    };

    const peticion = this.rutaSeleccionada
      ? this.http.put<any>(`${environment.apiUrl}/rutas/${this.rutaSeleccionada.id}`, body)
      : this.http.post<any>(`${environment.apiUrl}/rutas`, body);

    peticion.subscribe({
      next: () => {
        this.modoEdicion      = false;
        this.rutaSeleccionada = null;
        this.limpiarCapasTemporales();
        this.cargarRutas();
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudo guardar la ruta');
        this.cd.detectChanges();
      },
    });
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.limpiarCapasTemporales();
    if (this.rutaSeleccionada) {
      this.seleccionarRuta(this.rutaSeleccionada);
    } else {
      this.puntosRuta = [];
      this.formulario.reset();
    }
  }

  confirmarDesactivar(ruta: Ruta, evento: Event): void {
    evento.stopPropagation();
    const ref = this.dialog.open(ConfirmarDialogo, {
      data: {
        titulo:  'Desactivar ruta',
        mensaje: `¿Seguro que querés desactivar la ruta "${ruta.nombre}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.http.delete<any>(`${environment.apiUrl}/rutas/${ruta.id}`).subscribe({
        next: () => {
          if (this.rutaSeleccionada?.id === ruta.id) {
            this.rutaSeleccionada = null;
            this.limpiarCapasTemporales();
          }
          this.cargarRutas();
        },
        error: (err) => {
          this.mostrarError(err?.error?.message ?? 'No se pudo desactivar la ruta');
          this.cd.detectChanges();
        },
      });
    });
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}