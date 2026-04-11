import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
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
    NgClass, FormsModule,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule,
    MatTableModule, MatDialogModule, MatSnackBarModule,
    MatChipsModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vehiculos.componente.html',
  styleUrl:    './vehiculos.componente.css',
})
export class VehiculosComponente implements OnInit {
  columnas = ['placa', 'marca', 'modelo', 'capacidad_kg', 'estado', 'acciones'];
  vehiculos = new MatTableDataSource<Vehiculo>([]);
  cargando = false;
  filtroTexto = '';
  mostrarInactivos = false;

  get totalVehiculos()    { return this.vehiculos.data.length; }
  get totalOperativos()   { return this.vehiculos.data.filter(v => v.estado === 'operativo').length; }
  get totalAveriados()    { return this.vehiculos.data.filter(v => v.estado === 'averiado').length; }
  get totalInactivos()    { return this.vehiculos.data.filter(v => v.estado === 'inactivo').length; }

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.cargarVehiculos(); }

  cargarVehiculos(): void {
    this.cargando = true;
    this.cdr.markForCheck(); // Forzar detección al iniciar
    this.http.get<any>(`${environment.apiUrl}/vehiculos`).subscribe({
      next: (res) => {
        const all: Vehiculo[] = res.data || [];
        this.vehiculos.data = this.mostrarInactivos
          ? [...all]
          : [...all.filter((v: any) => v.estado !== 'inactivo')];

        this.vehiculos.filterPredicate = (data: Vehiculo, filter: string) => {
          const text = filter.trim().toLowerCase();
          if (!text) return true;
          return (data.placa || '').toLowerCase().includes(text)
            || (data.marca || '').toLowerCase().includes(text)
            || (data.modelo || '').toLowerCase().includes(text);
        };
        this.vehiculos.filter = this.filtroTexto.trim().toLowerCase();
        this.cargando = false;
        this.cdr.markForCheck(); // Forzar detección al completar
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar los vehículos');
        this.cargando = false;
        this.cdr.markForCheck();
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
      const req = vehiculo
        ? this.http.put<any>(`${environment.apiUrl}/vehiculos/${vehiculo.id}`, datos)
        : this.http.post<any>(`${environment.apiUrl}/vehiculos`, datos);
      req.subscribe({
        next: () => this.cargarVehiculos(),
        error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo guardar el vehículo'),
      });
    });
  }

  confirmarDesactivar(vehiculo: Vehiculo): void {
    const ref = this.dialog.open(ConfirmarDialogo, {
      data: {
        titulo: 'Desactivar vehículo',
        mensaje: `¿Desactivar el vehículo ${vehiculo.placa}?`,
      },
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.http.delete<any>(`${environment.apiUrl}/vehiculos/${vehiculo.id}`).subscribe({
        next: () => this.cargarVehiculos(),
        error: (err) => this.mostrarError(err?.error?.message ?? 'No se pudo desactivar'),
      });
    });
  }

  etiquetaEstado(estado: string): string {
    return { operativo: 'Operativo', averiado: 'Averiado', inactivo: 'Inactivo' }[estado] ?? estado;
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}