import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

import { AsignacionesFormDialogo } from './asignaciones-form.dialogo';
import { AsignacionEstadoDialogo } from './asignacion-estado.dialogo';
import { ConfirmarDialogo } from '../../compartido/confirmar.dialogo';

interface Asignacion {
  id: string;
  conductor_nombre: string;
  ruta_nombre: string;
  fecha: string;
  estado: 'pendiente' | 'en_curso' | 'completada' | 'cancelada';
}

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [
    CommonModule,
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
      <h2 class="titulo-seccion">Asignaciones</h2>
      <button mat-flat-button color="primary" (click)="abrirModalNueva()">
        <mat-icon>add</mat-icon> Nueva asignación
      </button>
    </div>

    @if (cargando) {
      <div class="centro">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    }

    <!-- Usando [style.display] para mantener la tabla en DOM y evitar parpadeos de MatTable -->
    <div class="tabla-contenedor mat-elevation-z2" [style.display]="cargando ? 'none' : 'block'">
      <table mat-table [dataSource]="asignaciones">

        <!-- Conductor -->
        <ng-container matColumnDef="conductor">
          <th mat-header-cell *matHeaderCellDef>Conductor</th>
          <td mat-cell *matCellDef="let a">{{ a.conductor_nombre }}</td>
        </ng-container>

        <!-- Ruta -->
        <ng-container matColumnDef="ruta">
          <th mat-header-cell *matHeaderCellDef>Ruta</th>
          <td mat-cell *matCellDef="let a">{{ a.ruta_nombre }}</td>
        </ng-container>

        <!-- Fecha -->
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let a">{{ formatearFecha(a.fecha) }}</td>
        </ng-container>

        <!-- Estado -->
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let a">
            <span class="chip" [ngClass]="'chip--' + a.estado">
              {{ etiquetaEstado(a.estado) }}
            </span>
          </td>
        </ng-container>

        <!-- Acciones -->
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let a">
            <button mat-stroked-button color="primary" (click)="cambiarEstado(a)">
              Cambiar estado
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnas"></tr>
        <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
      </table>
      
      @if (!cargando && asignaciones.length === 0) {
        <div class="sin-datos">No hay asignaciones registradas.</div>
      }
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
      background-color: white;
    }

    table {
      width: 100%;
    }

    th.mat-mdc-header-cell {
      font-weight: 600;
      color: #444;
    }

    .sin-datos {
      text-align: center;
      padding: 32px;
      color: #666;
    }

    /* Chips de estado */
    .chip {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      display: inline-block;
    }

    .chip--pendiente {
      background-color: #e3f2fd;
      color: #1976d2; /* Azul */
    }

    .chip--en_curso {
      background-color: #fff8e1;
      color: #f57f17; /* Amarillo */
    }

    .chip--completada {
      background-color: #e8f5e9;
      color: #2e7d32; /* Verde */
    }

    .chip--cancelada {
      background-color: #f5f5f5;
      color: #757575; /* Gris */
    }
  `]
})
export class AsignacionesComponente implements OnInit {
  columnas = ['conductor', 'ruta', 'fecha', 'estado', 'acciones'];
  asignaciones: Asignacion[] = [];
  cargando = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAsignaciones();
  }

  cargarAsignaciones(): void {
    this.cargando = true;
    this.cd.detectChanges();
    this.http.get<any>(`${environment.apiUrl}/asignaciones`).subscribe({
      next: (res) => {
        this.asignaciones = res.data;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar las asignaciones');
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  abrirModalNueva(): void {
    const ref = this.dialog.open(AsignacionesFormDialogo, {
      width: '420px',
    });

    ref.afterClosed().subscribe((datos) => {
      if (!datos) return;

      this.http.post<any>(`${environment.apiUrl}/asignaciones`, datos).subscribe({
        next: () => this.cargarAsignaciones(),
        error: (err) => {
          this.mostrarError(err?.error?.message ?? 'No se pudo crear la asignación');
          this.cd.detectChanges();
        }
      });
    });
  }

  cambiarEstado(asignacion: Asignacion): void {
    const refPrimerDialogo = this.dialog.open(AsignacionEstadoDialogo, {
      data: { estadoActual: asignacion.estado }
    });

    refPrimerDialogo.afterClosed().subscribe((nuevoEstado) => {
      if (!nuevoEstado || nuevoEstado === asignacion.estado) return;

      // Pide confirmación antes de guardar
      const etiqueta = this.etiquetaEstado(nuevoEstado).toLowerCase();
      const refConfirmacion = this.dialog.open(ConfirmarDialogo, {
        data: {
          titulo: 'Confirmar cambio de estado',
          mensaje: `¿Seguro que deseas marcar la asignación de ${asignacion.conductor_nombre} como "${etiqueta}"?`
        }
      });

      refConfirmacion.afterClosed().subscribe((confirmado) => {
        if (!confirmado) return;

        this.http.patch<any>(`${environment.apiUrl}/asignaciones/${asignacion.id}/estado`, { estado: nuevoEstado }).subscribe({
          next: () => this.cargarAsignaciones(),
          error: (err) => {
            this.mostrarError(err?.error?.message ?? 'No se pudo actualizar el estado de la asignación');
            this.cd.detectChanges(); // Forzar actualización de UI si algo falla
          }
        });
      });
    });
  }

  formatearFecha(fechaIso: string): string {
    if (!fechaIso) return '';
    try {
      const fecha = new Date(fechaIso);
      // Extrae YYYY-MM-DD independientemente del timezone utc/local
      const dateString = fecha.toISOString().split('T')[0];
      return dateString;
    } catch {
      return fechaIso;
    }
  }

  etiquetaEstado(estado: string): string {
    const etiquetas: Record<string, string> = {
      pendiente:  'Pendiente',
      en_curso:   'En curso',
      completada: 'Completada',
      cancelada:  'Cancelada'
    };
    return etiquetas[estado] ?? estado;
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
