import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { environment } from '../../../environments/environment';
import { VehiculoFormDialogo } from './vehiculo-form.dialogo';
import { ConfirmarDialogo } from '../../compartido/confirmar.dialogo';

interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  capacidad_kg: number | null;
  estado: 'operativo' | 'averiado' | 'inactivo';
}

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="cabecera">
      <div style="display:flex;gap:12px;align-items:center;">
        <h2 class="titulo-seccion">Vehículos</h2>
        <mat-form-field appearance="outline" style="width:320px; margin-left:12px;">
          <mat-label>Buscar (placa, marca, modelo)</mat-label>
          <input matInput (input)="aplicarFiltro($any($event.target).value)" placeholder="Ej: ABC123" />
        </mat-form-field>
        <mat-slide-toggle (change)="toggleMostrarInactivos()" color="primary">Mostrar inactivos</mat-slide-toggle>
      </div>
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>add</mat-icon> Nuevo vehículo
      </button>
    </div>
    <div *ngIf="cargando" class="centro">
      <mat-spinner diameter="48"></mat-spinner>
    </div>

    <div class="tabla-contenedor mat-elevation-z2" [style.display]="cargando ? 'none' : ''">
      <table mat-table [dataSource]="vehiculos">

        <!-- Placa -->
        <ng-container matColumnDef="placa">
          <th mat-header-cell *matHeaderCellDef>Placa</th>
          <td mat-cell *matCellDef="let v">{{ v.placa }}</td>
        </ng-container>

        <!-- Marca -->
        <ng-container matColumnDef="marca">
          <th mat-header-cell *matHeaderCellDef>Marca</th>
          <td mat-cell *matCellDef="let v">{{ v.marca }}</td>
        </ng-container>

        <!-- Modelo -->
        <ng-container matColumnDef="modelo">
          <th mat-header-cell *matHeaderCellDef>Modelo</th>
          <td mat-cell *matCellDef="let v">{{ v.modelo }}</td>
        </ng-container>

        <!-- Capacidad -->
        <ng-container matColumnDef="capacidad_kg">
          <th mat-header-cell *matHeaderCellDef>Capacidad (kg)</th>
          <td mat-cell *matCellDef="let v">{{ v.capacidad_kg ?? '—' }}</td>
        </ng-container>

        <!-- Estado -->
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let v">
            <span class="chip" [ngClass]="'chip--' + v.estado">
              {{ etiquetaEstado(v.estado) }}
            </span>
          </td>
        </ng-container>

        <!-- Acciones -->
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let v">
            <button mat-icon-button color="primary" title="Editar" (click)="abrirFormulario(v)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" title="Desactivar" (click)="confirmarDesactivar(v)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnas"></tr>
        <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      background: white;
      padding: 14px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .cabecera > div { display:flex; align-items:center; gap:12px; }

    .titulo-seccion {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--brand-green-dark);
    }

    .centro {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .tabla-contenedor {
      border-radius: 8px;
      overflow: hidden;
      background: white;
      padding: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th.mat-mdc-header-cell {
      font-weight: 600;
      color: var(--brand-green-dark);
      background: var(--brand-green-light);
      background-color: var(--brand-green-light);
      opacity: 0.95;
    }

    tr.mat-row:hover { background: rgba(30,140,52,0.04); }

    /* Estilo botones primary dentro del componente */
    button[mat-flat-button][color="primary"], button.mat-flat-button.mat-primary {
      background-color: var(--brand-green);
      color: #fff;
    }

    /* Chips de estado */
    .chip {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .chip--operativo {
      background-color: #e8f5e9;
      color: var(--brand-green-dark);
    }

    .chip--averiado {
      background-color: #fff8e1;
      color: #f57f17;
    }

    .chip--inactivo {
      background-color: var(--brand-gray);
      color: var(--brand-muted);
    }

    /* Mat-form-field tweaks */
    .mat-form-field-appearance-outline .mat-form-field-outline { border-color: rgba(0,0,0,0.06); }
    input[matInput] { padding: 10px 12px; }
  `],
})
export class VehiculosComponente implements OnInit {
  columnas = ['placa', 'marca', 'modelo', 'capacidad_kg', 'estado', 'acciones'];
  vehiculos = new MatTableDataSource<Vehiculo>([]);
  cargando = false;
  filtroTexto = '';
  mostrarInactivos = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/vehiculos`).subscribe({
      next: (res) => {
        console.log('respuesta:', res);
        const all: Vehiculo[] = res.data || [];
        // aplicar filtro de mostrarInactivos
        this.vehiculos.data = this.mostrarInactivos ? [...all] : [...all.filter((v: any) => v.estado !== 'inactivo')];

        // configurar predicate para filtrar por placa/marca/modelo
        this.vehiculos.filterPredicate = (data: Vehiculo, filter: string) => {
          const text = filter.trim().toLowerCase();
          if (!text) return true;
          return (data.placa || '').toLowerCase().includes(text)
            || (data.marca || '').toLowerCase().includes(text)
            || (data.modelo || '').toLowerCase().includes(text);
        };

        // reaplicar filtro actual
        this.vehiculos.filter = this.filtroTexto.trim().toLowerCase();
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar los vehículos');
        this.cargando = false;
      },
    });
  }

  aplicarFiltro(text?: string): void {
    this.filtroTexto = (text ?? this.filtroTexto) as string;
    this.vehiculos.filter = this.filtroTexto.trim().toLowerCase();
  }

  toggleMostrarInactivos(): void {
    this.mostrarInactivos = !this.mostrarInactivos;
    this.cargarVehiculos();
  }

  abrirFormulario(vehiculo?: Vehiculo): void {
    const ref = this.dialog.open(VehiculoFormDialogo, {
      width: '420px',
      data: { vehiculo },
    });

    ref.afterClosed().subscribe((datos) => {
      if (!datos) return;

      if (vehiculo) {
        // Editar
        this.http.put<any>(`${environment.apiUrl}/vehiculos/${vehiculo.id}`, datos).subscribe({
          next: () => this.cargarVehiculos(),
          error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo actualizar el vehículo'),
        });
      } else {
        // Crear
        this.http.post<any>(`${environment.apiUrl}/vehiculos`, datos).subscribe({
          next: () => this.cargarVehiculos(),
          error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo crear el vehículo'),
        });
      }
    });
  }

  confirmarDesactivar(vehiculo: Vehiculo): void {
    const ref = this.dialog.open(ConfirmarDialogo, {
      data: {
        titulo: 'Desactivar vehículo',
        mensaje: `¿Desactivar el vehículo ${vehiculo.placa}? Ya no aparecerá en la lista.`,
      },
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.http.delete<any>(`${environment.apiUrl}/vehiculos/${vehiculo.id}`).subscribe({
        next: () => this.cargarVehiculos(),
        error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo desactivar el vehículo'),
      });
    });
  }

  etiquetaEstado(estado: string): string {
    const etiquetas: Record<string, string> = {
      operativo: 'Operativo',
      averiado:  'Averiado',
      inactivo:  'Inactivo',
    };
    return etiquetas[estado] ?? estado;
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
