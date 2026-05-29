import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, SlicePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

interface ReporteFoto {
  id: string;
  recorrido_id: string;
  posicion_id: string;
  external_posicion_id: string | null;
  created_at: string;
  conductor_nombre: string;
  ruta_nombre: string;
}

@Component({
  selector: 'app-ver-foto-dialogo',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="dialogo-contenedor">
      <h3 class="dialogo-titulo">Foto del Reporte</h3>
      <div class="dialogo-imagen-wrapper">
        <img [src]="data.foto_base64" alt="Reporte" class="dialogo-imagen">
      </div>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close class="btn-cerrar">Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialogo-contenedor {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      max-width: 500px;
      font-family: 'Nunito', sans-serif;
    }
    .dialogo-titulo {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 900;
      color: #111;
    }
    .dialogo-imagen-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f9f9f9;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #eee;
    }
    .dialogo-imagen {
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
    }
    .btn-cerrar {
      font-weight: 700;
      color: #1e8c34;
    }
  `]
})
export class VerFotoDialogo {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { foto_base64: string }) {}
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './reportes.componente.html',
  styleUrl: './reportes.componente.scss'
})
export class ReportesComponente implements OnInit {
  columnas = ['conductor', 'ruta', 'fecha', 'foto', 'acciones'];
  reportes = new MatTableDataSource<ReporteFoto>([]);
  cargando = false;
  cargandoFotoId: string | null = null;
  private cacheFotos: { [id: string]: string } = {};

  get totalReportes() { return this.reportes.data.length; }

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.cargando = true;
    this.http.get<any>(`${environment.apiUrl}/reportes`).subscribe({
      next: (res) => {
        this.reportes.data = res.data || [];
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.message ?? 'No se pudieron cargar los reportes de foto');
        this.cargando = false;
      }
    });
  }

  verFoto(reporte: ReporteFoto): void {
    if (this.cacheFotos[reporte.id]) {
      this.dialog.open(VerFotoDialogo, {
        width: '90%',
        maxWidth: '540px',
        data: { foto_base64: this.cacheFotos[reporte.id] }
      });
      return;
    }

    if (this.cargandoFotoId === reporte.id) return;
    
    this.cargandoFotoId = reporte.id;
    this.http.get<any>(`${environment.apiUrl}/reportes/${reporte.id}/foto`).subscribe({
      next: (res) => {
        this.cargandoFotoId = null;
        if (res.data && res.data.foto_base64) {
          this.cacheFotos[reporte.id] = res.data.foto_base64;
          this.dialog.open(VerFotoDialogo, {
            width: '90%',
            maxWidth: '540px',
            data: { foto_base64: res.data.foto_base64 }
          });
        } else {
          this.mostrarError('La imagen no fue encontrada en el servidor');
        }
      },
      error: (err) => {
        this.cargandoFotoId = null;
        this.mostrarError(err?.error?.message ?? 'No se pudo descargar la imagen del reporte');
      }
    });
  }

  private mostrarError(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
