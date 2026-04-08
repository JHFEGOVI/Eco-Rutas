import { Component, Inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';

export interface DatosRutaDialogo {
  ruta?: {
    id: string;
    nombre: string;
    descripcion: string;
    geometria: any; // GeoJSON
    activa: boolean;
  };
}

@Component({
  selector: 'app-rutas-form-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar ruta' : 'Nueva ruta' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-contenedor">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej. Ruta Norte Principal" />
          @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="2" placeholder="Detalles de la ruta"></textarea>
        </mat-form-field>

        <div class="mapa-wrapper">
          <label class="mapa-label">Trazado de la ruta en el mapa (Haz clic para añadir puntos)</label>
          <div class="mapa-controles">
            <button type="button" mat-stroked-button color="primary" (click)="deshacerPunto()" [disabled]="puntos.length === 0">
              <mat-icon>undo</mat-icon> Deshacer último
            </button>
            <button type="button" mat-stroked-button color="warn" (click)="limpiarMapa()" [disabled]="puntos.length === 0">
              <mat-icon>clear_all</mat-icon> Limpiar todo
            </button>
          </div>
          <div id="rutas-dialog-mapa" class="mapa"></div>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid || puntos.length < 2">
        {{ esEdicion ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-contenedor {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 500px;
      padding-top: 8px;
    }

    mat-form-field {
      width: 100%;
    }

    .mapa-wrapper {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mapa-label {
      font-weight: 500;
      color: #555;
    }

    .mapa-controles {
      display: flex;
      gap: 8px;
    }

    .mapa {
      height: 350px;
      width: 100%;
      border-radius: 8px;
      border: 1px solid #ccc;
      z-index: 10;
    }
  `],
})
export class RutasFormDialogo implements OnInit, AfterViewInit, OnDestroy {
  form!: FormGroup;
  esEdicion = false;
  
  private map!: L.Map;
  private polyline!: L.Polyline;
  puntos: L.LatLng[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RutasFormDialogo>,
    @Inject(MAT_DIALOG_DATA) public datos: DatosRutaDialogo,
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.datos?.ruta;

    this.form = this.fb.group({
      nombre: [this.datos?.ruta?.nombre ?? '', Validators.required],
      descripcion: [this.datos?.ruta?.descripcion ?? ''],
    });

    if (this.esEdicion && this.datos.ruta?.geometria) {
      this.cargarGeometria(this.datos.ruta.geometria);
    }
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    // Configuración inicial (Coordenadas por defecto)
    let centro: L.LatLngExpression = [4.6097, -74.0817]; // Bogotá
    let zoomLevel = 13;

    if (this.puntos.length > 0) {
      centro = this.puntos[0];
      zoomLevel = 14;
    }

    this.map = L.map('rutas-dialog-mapa').setView(centro, zoomLevel);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(this.map);

    this.polyline = L.polyline(this.puntos, { color: 'blue', weight: 4 }).addTo(this.map);

    if (this.puntos.length > 0) {
      this.map.fitBounds(this.polyline.getBounds(), { padding: [20, 20] });
    }

    // Agregar puntos al hacer click
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.puntos.push(e.latlng);
      this.actualizarLinea();
    });
  }

  private actualizarLinea(): void {
    if (this.polyline) {
      this.polyline.setLatLngs(this.puntos);
    }
  }

  deshacerPunto(): void {
    if (this.puntos.length > 0) {
      this.puntos.pop();
      this.actualizarLinea();
    }
  }

  limpiarMapa(): void {
    this.puntos = [];
    this.actualizarLinea();
  }

  private cargarGeometria(geometria: any): void {
    if (geometria && geometria.type === 'LineString' && Array.isArray(geometria.coordinates)) {
      this.puntos = geometria.coordinates.map((coord: number[]) => {
        // GeoJSON [lng, lat] -> Leaflet [lat, lng]
        return L.latLng(coord[1], coord[0]);
      });
    }
  }

  guardar(): void {
    if (this.form.invalid || this.puntos.length < 2) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      nombre: this.form.value.nombre,
      descripcion: this.form.value.descripcion,
      geometria: {
        type: 'LineString',
        coordinates: this.puntos.map(p => [p.lng, p.lat]) // Leaflet [lat, lng] -> GeoJSON [lng, lat]
      }
    };

    this.dialogRef.close(payload);
  }
}
