import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface DatosEstadoAsignacion {
  estadoActual: string;
}

@Component({
  selector: 'app-asignacion-estado-dialogo',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  template: `
    <div class="dialogo-cabecera">
      <div class="dialogo-cabecera-icono"><mat-icon>swap_horiz</mat-icon></div>
      <div class="dialogo-cabecera-texto">
        <h2 class="dialogo-titulo">Cambiar estado</h2>
        <p class="dialogo-subtitulo">Seleccione el nuevo estado para esta asignación</p>
      </div>
    </div>

    <mat-dialog-content class="dialogo-cuerpo">
      <form [formGroup]="formulario" class="dialogo-form">
        <div class="campo-grupo">
          <label class="campo-label">Estado</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">info</mat-icon>
            <select class="campo-input campo-select" formControlName="nuevoEstado">
              <option value="pendiente">Pendiente</option>
              <option value="en_curso">En curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialogo-acciones">
      <button class="btn-cancelar" mat-dialog-close>Cancelar</button>
      <button class="btn-guardar" [disabled]="formulario.invalid" (click)="guardar()">Continuar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

    :host { font-family: 'Nunito', sans-serif; display:block; }
    .dialogo-cabecera { display:flex; align-items:center; gap:10px; background:#1e8c34; padding:10px 12px; margin:0; border-radius:4px 4px 0 0; }
    .dialogo-cabecera-icono { width:48px; height:48px; background:rgba(255,255,255,0.15); border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .dialogo-cabecera-icono mat-icon { font-size:26px !important; color:#fff; }
    .dialogo-titulo { font-size:1.05rem; font-weight:900; color:#fff; margin:0 0 2px; }
    .dialogo-subtitulo { font-size:0.72rem; color:rgba(255,255,255,0.85); margin:0; }

    .dialogo-cuerpo { padding:12px 12px 8px !important; max-height:none; }
    .dialogo-form { display:flex; flex-direction:column; gap:8px; }
    .campo-grupo { display:flex; flex-direction:column; gap:5px; }
    .campo-label { font-size:0.65rem; font-weight:700; color:#555; text-transform:uppercase; }
    .campo-wrap { position:relative; display:flex; align-items:center; }
    .campo-icono { position:absolute; left:10px; font-size:15px !important; color:#bdbdbd; }
    .campo-input { width:100%; height:40px; padding:0 12px 0 36px; border:1px solid #e8e8e8; border-radius:8px; background:#fafafa; }
    .campo-error { color:#e53935; font-size:0.78rem; }
    .dialogo-acciones { display:flex !important; justify-content:flex-end !important; gap:8px !important; padding:10px 12px !important; border-top:1px solid #f0f0f0; }
    .btn-cancelar { padding:0.55rem 1.25rem; background:transparent; border:1.5px solid #e0e0e0; border-radius:9px; font-weight:700; color:#555; }
    .btn-guardar { display:flex; align-items:center; gap:7px; padding:0.55rem 1.4rem; background:#1e8c34; color:#fff; border:none; border-radius:9px; font-weight:700; box-shadow:0 3px 10px rgba(30,140,52,0.3); }
    .btn-guardar:focus, .btn-guardar:focus-visible {
      outline: none;
      box-shadow: 0 6px 18px rgba(30,140,52,0.25);
    }
  `]
})
export class AsignacionEstadoDialogo {
  formulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AsignacionEstadoDialogo>,
    @Inject(MAT_DIALOG_DATA) public datos: DatosEstadoAsignacion
  ) {
    this.formulario = this.fb.group({
      nuevoEstado: [datos.estadoActual, Validators.required]
    });
  }

  guardar(): void {
    if (this.formulario.valid) {
      this.dialogRef.close(this.formulario.value.nuevoEstado);
    }
  }
}
