import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-asignaciones-form-dialogo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialogo-cabecera">
      <div class="dialogo-cabecera-icono"><mat-icon>assignment_ind</mat-icon></div>
      <div class="dialogo-cabecera-texto">
        <h2 class="dialogo-titulo">Nueva asignación</h2>
        <p class="dialogo-subtitulo">Asigna un conductor a una ruta y fecha</p>
      </div>
    </div>

    <mat-dialog-content class="dialogo-cuerpo">
      <form [formGroup]="formulario" class="dialogo-form">

        <div class="campo-grupo">
          <label class="campo-label">Conductor</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">person</mat-icon>
            <select class="campo-input campo-select" formControlName="conductor_id">
              @for (c of conductores; track c.id) {
                <option value="{{ c.id }}">{{ c.nombre }} ({{ c.documento }})</option>
              }
            </select>
          </div>
          @if (formulario.get('conductor_id')?.hasError('required') && formulario.get('conductor_id')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>Debes elegir un conductor</span>
          }
        </div>

        <div class="campo-grupo">
          <label class="campo-label">Ruta</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">map</mat-icon>
            <select class="campo-input campo-select" formControlName="ruta_id">
              @for (r of rutas; track r.id) {
                <option value="{{ r.id }}">{{ r.nombre }}</option>
              }
            </select>
          </div>
          @if (formulario.get('ruta_id')?.hasError('required') && formulario.get('ruta_id')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>Debes elegir una ruta</span>
          }
        </div>

        <div class="campo-grupo">
          <label class="campo-label">Fecha de asignación</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">event</mat-icon>
            <input class="campo-input" type="date" formControlName="fecha" />
          </div>
          @if (formulario.get('fecha')?.hasError('required') && formulario.get('fecha')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>La fecha es obligatoria</span>
          }
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialogo-acciones">
      <button class="btn-cancelar" mat-dialog-close>Cancelar</button>
      <button class="btn-guardar" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

    :host { font-family: 'Nunito', sans-serif; display:block; }

    .dialogo-cabecera { display:flex; align-items:center; gap:10px; background:#1e8c34; padding:10px 12px; margin:0; border-radius:4px 4px 0 0; }
    .dialogo-cabecera-icono { width:48px; height:48px; background:rgba(255,255,255,0.15); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .dialogo-cabecera-icono mat-icon { font-size:26px !important; color:#fff; }
    .dialogo-titulo { font-size:1.05rem; font-weight:900; color:#fff; margin:0 0 2px; }
    .dialogo-subtitulo { font-size:0.72rem; color:rgba(255,255,255,0.85); margin:0; }

    .dialogo-cuerpo { padding:12px 12px 8px !important; max-height:none; overflow-y:visible; }
    .dialogo-form { display:flex; flex-direction:column; gap:8px; }

    .campo-grupo { display:flex; flex-direction:column; gap:5px; }
    .campo-label { font-size:0.65rem; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.8px; }

    .campo-wrap { position:relative; display:flex; align-items:center; }
    .campo-icono { position:absolute; left:10px; font-size:15px !important; color:#bdbdbd; }
    .campo-input { width:100%; height:40px; padding:0 12px 0 36px; border:1px solid #e8e8e8; border-radius:8px; background:#fafafa; font-size:0.83rem; }
    .campo-input:focus { border-color:#1e8c34; background:#fff; box-shadow:0 0 0 3px rgba(30,140,52,0.12); }
    .campo-wrap:focus-within .campo-icono { color:#1e8c34; }
    .campo-select { appearance:none; }

    .campo-error { display:flex; align-items:center; gap:4px; font-size:0.68rem; color:#e53935; padding-left:2px; }
    .error-icono { font-size:13px !important; }

    .dialogo-acciones { display:flex !important; justify-content:flex-end !important; gap:8px !important; padding:10px 12px !important; border-top:1px solid #f0f0f0; margin:0; }
    .btn-cancelar { padding:0.55rem 1.25rem; background:transparent; border:1.5px solid #e0e0e0; border-radius:9px; font-size:0.82rem; font-weight:700; color:#555; cursor:pointer; }
    .btn-guardar { display:flex; align-items:center; gap:7px; padding:0.55rem 1.4rem; background:#1e8c34; color:#fff; border:none; border-radius:9px; font-size:0.85rem; font-weight:700; cursor:pointer; box-shadow:0 3px 10px rgba(30,140,52,0.3); }
  `],
})
export class AsignacionesFormDialogo implements OnInit {
  formulario: FormGroup;
  conductores: any[] = [];
  rutas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<AsignacionesFormDialogo>
  ) {
    this.formulario = this.fb.group({
      conductor_id: ['', Validators.required],
      ruta_id:      ['', Validators.required],
      fecha:        ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Cargar conductores filtrando por su rol
    this.http.get<any>(`${environment.apiUrl}/usuarios`).subscribe(res => {
      this.conductores = res.data.filter((u: any) => u.rol === 'conductor' && u.activo !== false);
    });

    // Cargar rutas disponibles
    this.http.get<any>(`${environment.apiUrl}/rutas`).subscribe(res => {
      this.rutas = res.data;
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    
    // El input type="date" nativo ya devuelve formato "YYYY-MM-DD"
    const datosRaw = this.formulario.value;

    this.dialogRef.close({
      conductor_id: datosRaw.conductor_id,
      ruta_id: datosRaw.ruta_id,
      fecha: datosRaw.fecha
    });
  }
}
