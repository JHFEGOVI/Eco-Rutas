import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { ConductoresFormDialogo } from './conductores-form.dialogo';
import { ConfirmarDialogo } from '../../compartido/confirmar.dialogo';

interface Conductor {
  id: string;
  nombre: string;
  documento: string;
  email: string;
  username: string;
  rol: string;
  activo: boolean;
}

@Component({
  selector: 'app-conductores',
  standalone: true,
  imports: [
    NgClass,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="cabecera">
      <h2 class="titulo-seccion">Conductores</h2>
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>person_add</mat-icon> Nuevo conductor
      </button>
    </div>

    @if (cargando) {
      <div class="centro">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    }

    <div class="tabla-contenedor mat-elevation-z2" [style.display]="cargando ? 'none' : ''">
      <table mat-table [dataSource]="conductores">

        <!-- Nombre -->
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let c">{{ c.nombre }}</td>
        </ng-container>

        <!-- Documento -->
        <ng-container matColumnDef="documento">
          <th mat-header-cell *matHeaderCellDef>Documento</th>
          <td mat-cell *matCellDef="let c">{{ c.documento }}</td>
        </ng-container>

        <!-- Email -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Correo</th>
          <td mat-cell *matCellDef="let c">{{ c.email }}</td>
        </ng-container>

        <!-- Usuario -->
        <ng-container matColumnDef="usuario">
          <th mat-header-cell *matHeaderCellDef>Usuario</th>
          <td mat-cell *matCellDef="let c">{{ c.username }}</td>
        </ng-container>

        <!-- Estado -->
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let c">
            <span class="chip" [ngClass]="c.activo ? 'chip--activo' : 'chip--inactivo'">
              {{ c.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
        </ng-container>

        <!-- Acciones -->
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let c">
            <button mat-icon-button color="primary" title="Editar" (click)="abrirFormulario(c)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" title="Desactivar" (click)="confirmarDesactivar(c)">
              <mat-icon>person_off</mat-icon>
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

    .chip {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .chip--activo {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .chip--inactivo {
      background-color: #f5f5f5;
      color: #757575;
    }
  `],
})
export class ConductoresComponente implements OnInit {
  columnas = ['nombre', 'documento', 'email', 'usuario', 'estado', 'acciones'];
  conductores = new MatTableDataSource<Conductor>([]);
  cargando = false;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cargarConductores();
  }

  cargarConductores(): void {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (res) => {
        this.conductores.data = res.data;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar los conductores');
        this.cargando = false;
      },
    });
  }

  abrirFormulario(conductor?: Conductor): void {
    const ref = this.dialog.open(ConductoresFormDialogo, {
      width: '440px',
      data: { conductor },
    });

    ref.afterClosed().subscribe((datos) => {
      if (!datos) return;

      if (conductor) {
        // Editar
        this.http.put<any>(`${environment.apiUrl}/usuarios/${conductor.id}`, datos).subscribe({
          next: () => this.cargarConductores(),
          error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo actualizar el conductor'),
        });
      } else {
        // Crear
        this.http.post<any>(`${environment.apiUrl}/usuarios`, datos).subscribe({
          next: () => this.cargarConductores(),
          error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo crear el conductor'),
        });
      }
    });
  }

  confirmarDesactivar(conductor: Conductor): void {
    const ref = this.dialog.open(ConfirmarDialogo, {
      data: {
        titulo: 'Desactivar conductor',
        mensaje: `¿Seguro que querés desactivar a ${conductor.nombre}?`,
      },
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.http.delete<any>(`${environment.apiUrl}/usuarios/${conductor.id}`).subscribe({
        next: () => this.cargarConductores(),
        error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo desactivar el conductor'),
      });
    });
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
