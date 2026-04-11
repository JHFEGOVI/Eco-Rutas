import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    CommonModule, NgClass,
    MatTableModule, MatDialogModule, MatSnackBarModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './asignaciones.componente.html',
  styleUrl:    './asignaciones.componente.css',
})
export class AsignacionesComponente implements OnInit {
  columnas = ['conductor', 'ruta', 'fecha', 'estado', 'acciones'];
  asignaciones: Asignacion[] = [];
  cargando = false;

  get totalAsignaciones()  { return this.asignaciones.length; }
  get totalPendientes()    { return this.asignaciones.filter(a => a.estado === 'pendiente').length; }
  get totalEnCurso()       { return this.asignaciones.filter(a => a.estado === 'en_curso').length; }
  get totalCompletadas()   { return this.asignaciones.filter(a => a.estado === 'completada').length; }

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.cargarAsignaciones(); }

  cargarAsignaciones(): void {
    this.cargando = true;
    this.cd.detectChanges();
    this.http.get<any>(`${environment.apiUrl}/asignaciones`).subscribe({
      next: (res) => { this.asignaciones = res.data; this.cargando = false; this.cd.detectChanges(); },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar las asignaciones');
        this.cargando = false; this.cd.detectChanges();
      },
    });
  }

  abrirModalNueva(): void {
    const ref = this.dialog.open(AsignacionesFormDialogo, { width: '420px' });
    ref.afterClosed().subscribe((datos) => {
      if (!datos) return;
      this.http.post<any>(`${environment.apiUrl}/asignaciones`, datos).subscribe({
        next: () => this.cargarAsignaciones(),
        error: (err) => { this.mostrarError(err?.error?.message ?? 'No se pudo crear la asignación'); this.cd.detectChanges(); },
      });
    });
  }

  cambiarEstado(asignacion: Asignacion): void {
    const ref = this.dialog.open(AsignacionEstadoDialogo, { data: { estadoActual: asignacion.estado } });
    ref.afterClosed().subscribe((nuevoEstado) => {
      if (!nuevoEstado || nuevoEstado === asignacion.estado) return;
      const etiqueta = this.etiquetaEstado(nuevoEstado).toLowerCase();
      const ref2 = this.dialog.open(ConfirmarDialogo, {
        data: { titulo: 'Confirmar cambio de estado', mensaje: `¿Marcar asignación de ${asignacion.conductor_nombre} como "${etiqueta}"?` },
      });
      ref2.afterClosed().subscribe((confirmado) => {
        if (!confirmado) return;
        this.http.patch<any>(`${environment.apiUrl}/asignaciones/${asignacion.id}/estado`, { estado: nuevoEstado }).subscribe({
          next: () => this.cargarAsignaciones(),
          error: (err) => { this.mostrarError(err?.error?.message ?? 'No se pudo actualizar el estado'); this.cd.detectChanges(); },
        });
      });
    });
  }

  formatearFecha(fechaIso: string): string {
    if (!fechaIso) return '';
    try { return new Date(fechaIso).toISOString().split('T')[0]; } catch { return fechaIso; }
  }

  etiquetaEstado(estado: string): string {
    return { pendiente: 'Pendiente', en_curso: 'En curso', completada: 'Completada', cancelada: 'Cancelada' }[estado] ?? estado;
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}