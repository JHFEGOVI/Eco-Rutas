import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    NgClass,
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
      <h2 class="titulo-seccion">Vehículos</h2>
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>add</mat-icon> Nuevo vehículo
      </button>
    </div>

    @if (cargando) {
      <div class="centro">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    }

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
    }

    .titulo-seccion {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .centro {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .tabla-contenedor {
      border-radius: 8px;
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    th.mat-mdc-header-cell {
      font-weight: 600;
      color: #444;
    }

    /* Chips de estado */
    .chip {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .chip--operativo {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .chip--averiado {
      background-color: #fff8e1;
      color: #f57f17;
    }

    .chip--inactivo {
      background-color: #f5f5f5;
      color: #757575;
    }
  `],
})
export class VehiculosComponente implements OnInit {
  columnas = ['placa', 'marca', 'modelo', 'capacidad_kg', 'estado', 'acciones'];
  vehiculos = new MatTableDataSource<Vehiculo>([]);
  cargando = false;

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
        this.vehiculos.data = res.data;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar los vehículos');
        this.cargando = false;
      },
    });
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
        mensaje: `¿Seguro que querés desactivar el vehículo ${vehiculo.placa}?`,
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
