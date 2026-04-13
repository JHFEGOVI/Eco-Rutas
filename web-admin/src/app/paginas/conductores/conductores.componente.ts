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
    MatTableModule, MatDialogModule, MatSnackBarModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './conductores.componente.html',
  styleUrl:    './conductores.componente.css',
})
export class ConductoresComponente implements OnInit {
  columnas = ['nombre', 'documento', 'email', 'usuario', 'estado', 'acciones'];
  conductores = new MatTableDataSource<Conductor>([]);
  cargando = false;

  get totalConductores() { return this.conductores.data.length; }
  get totalActivos()     { return this.conductores.data.filter(c => c.activo).length; }
  get totalInactivos()   { return this.conductores.data.filter(c => !c.activo).length; }

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void { this.cargarConductores(); }

  cargarConductores(): void {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (res) => { this.conductores.data = res.data; this.cargando = false; },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar los conductores');
        this.cargando = false;
      },
    });
  }

  inicialesConductor(nombre: string): string {
    return nombre?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? '??';
  }

  abrirFormulario(conductor?: Conductor): void {
    const ref = this.dialog.open(ConductoresFormDialogo, {
      width: '440px',
      data: { conductor },
    });
    ref.afterClosed().subscribe((datos) => {
      if (!datos) return;
      const req = conductor
        ? this.http.put<any>(`${environment.apiUrl}/usuarios/${conductor.id}`, datos)
        : this.http.post<any>(`${environment.apiUrl}/usuarios`, datos);
      req.subscribe({
        next: () => this.cargarConductores(),
        error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo guardar el conductor'),
      });
    });
  }

  alternarEstado(conductor: Conductor): void {
    const accion = conductor.activo ? 'Desactivar' : 'Activar';
    const dialogData: any = { titulo: `${accion} conductor`, mensaje: `¿${accion} a ${conductor.nombre}?` };
    // Color: rojo para desactivar, verde para activar. Ocultar icono al activar.
    dialogData.confirmColor = conductor.activo ? 'red' : 'green';
    if (!conductor.activo) dialogData.icon = null;
    const ref = this.dialog.open(ConfirmarDialogo, { data: dialogData });
    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      const req = conductor.activo
        ? this.http.delete<any>(`${environment.apiUrl}/usuarios/${conductor.id}`)
        : this.http.patch<any>(`${environment.apiUrl}/usuarios/${conductor.id}/activar`, {});
      req.subscribe({
        next: () => this.cargarConductores(),
        error: (err) => this.mostrarError(err?.error?.message ?? `No se pudo ${accion.toLowerCase()}`),
      });
    });
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}