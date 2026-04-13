import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface DatosVehiculoDialogo {
  vehiculo?: any;
}

@Component({
  selector: 'app-vehiculo-form-dialogo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  template: `
    <div class="dialogo-cabecera">
      <div class="dialogo-cabecera-icono">
        <mat-icon>local_shipping</mat-icon>
      </div>
      <div class="dialogo-cabecera-texto">
        <h2 class="dialogo-titulo">{{ datos.vehiculo ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>
        <p class="dialogo-subtitulo">Completa los datos del vehículo recolector</p>
      </div>
    </div>

    <mat-dialog-content class="dialogo-cuerpo">
      <form [formGroup]="formulario" class="dialogo-form">

        <div class="campo-grupo">
          <label class="campo-label">Placa</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">directions_car</mat-icon>
            <input class="campo-input" formControlName="placa" placeholder="Ej: ABC-123" maxlength="7" autocomplete="off"/>
          </div>
          @if (formulario.get('placa')?.hasError('required') && formulario.get('placa')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>La placa es requerida</span>
          }
          @if (formulario.get('placa')?.hasError('pattern') && formulario.get('placa')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>Formato inválido</span>
          }
          @if (!formulario.get('placa')?.hasError('pattern')) {
            <span class="campo-help">Formato válido: ABC-123</span>
          }
        </div>

        <div class="campos-fila">
          <div class="campo-grupo">
            <label class="campo-label">Marca</label>
            <div class="campo-wrap">
              <mat-icon class="campo-icono">business</mat-icon>
              <input class="campo-input" formControlName="marca" placeholder="Marca" autocomplete="off"/>
            </div>
            @if (formulario.get('marca')?.hasError('required') && formulario.get('marca')?.touched) {
              <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>La marca es requerida</span>
            }
          </div>
          <div class="campo-grupo">
            <label class="campo-label">Modelo</label>
            <div class="campo-wrap">
              <mat-icon class="campo-icono">calendar_today</mat-icon>
              <input class="campo-input" formControlName="modelo" placeholder="Modelo" autocomplete="off"/>
            </div>
            @if (formulario.get('modelo')?.hasError('required') && formulario.get('modelo')?.touched) {
              <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>El modelo es requerido</span>
            }
          </div>
        </div>

        <div class="campo-grupo">
          <label class="campo-label">Capacidad (kg)</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">scale</mat-icon>
            <input class="campo-input" type="number" formControlName="capacidad_kg" placeholder="Capacidad en kg" autocomplete="off"/>
          </div>
        </div>

        <div class="campo-grupo">
          <label class="campo-label">Estado</label>
          <div class="campo-wrap campo-wrap--select">
            <mat-icon class="campo-icono">info</mat-icon>
            <select class="campo-input campo-select" formControlName="estado">
              <option value="operativo">Operativo</option>
              <option value="averiado">Averiado</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialogo-acciones">
      <button class="btn-cancelar" mat-dialog-close>Cancelar</button>
      <button class="btn-guardar" [disabled]="formulario.invalid" (click)="guardar()">
        <mat-icon>check</mat-icon>
        {{ datos.vehiculo ? 'Guardar cambios' : 'Guardar vehículo' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

    :host { font-family: 'Nunito', sans-serif; display: block; }

    /* ── Cabecera ── */
    .dialogo-cabecera {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #1e8c34;
      padding: 10px 12px;
      margin: 0;
      border-radius: 4px 4px 0 0;
    }

    .dialogo-cabecera-icono {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dialogo-cabecera-icono mat-icon {
      font-size: 26px !important;
      width: 26px !important;
      height: 26px !important;
      color: #fff;
    }

    .dialogo-titulo {
      font-size: 1.05rem;
      font-weight: 900;
      color: #fff;
      margin: 0 0 2px;
      letter-spacing: -0.3px;
    }

    .dialogo-subtitulo {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.75);
      margin: 0;
    }

    /* ── Cuerpo ── */
    .dialogo-cuerpo {
      padding: 12px 12px 8px !important;
      max-height: none;
      overflow-y: visible;
    }

    .dialogo-form { display: flex; flex-direction: column; gap: 8px; }

    .campos-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    /* ── Campo ── */
    .campo-grupo { display: flex; flex-direction: column; gap: 5px; }

    .campo-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .campo-wrap { position: relative; display: flex; align-items: center; }

    .campo-icono {
      position: absolute;
      left: 10px;
      font-size: 15px !important;
      width: 15px !important;
      height: 15px !important;
      color: #bdbdbd;
      pointer-events: none;
      transition: color 0.2s;
    }

    .campo-input {
      width: 100%;
      height: 40px;
      padding: 0 12px 0 36px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      background: #fafafa;
      font-size: 0.83rem;
      color: #212121;
      outline: none;
      font-family: 'Nunito', sans-serif;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }

    .campo-input::placeholder { color: #bdbdbd; }

    .campo-input:focus { border-color: #1e8c34; background: #fff; box-shadow: 0 0 0 3px rgba(30,140,52,0.12); }

    .campo-wrap:focus-within .campo-icono { color: #1e8c34; }

    /* Select */
    .campo-wrap--select::after {
      content: '';
      position: absolute;
      right: 14px;
      width: 0; height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #9e9e9e;
      pointer-events: none;
    }

    .campo-select { appearance: none; cursor: pointer; }

    /* Error */
    .campo-error { display: flex; align-items: center; gap: 4px; font-size: 0.68rem; color: #e53935; padding-left: 2px; }

    .error-icono { font-size: 13px !important; width: 13px !important; height: 13px !important; }

    .campo-help { font-size: 0.68rem; color: #757575; padding-left: 2px; }

    /* ── Botones ── */
    .dialogo-acciones { display: flex !important; justify-content: flex-end !important; gap: 8px !important; padding: 10px 12px !important; border-top: 1px solid #f0f0f0; margin: 0; }

    .btn-cancelar {
      padding: 0.55rem 1.25rem; background: transparent; border: 1.5px solid #e0e0e0; border-radius: 9px; font-size: 0.82rem; font-weight: 700; color: #555; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.15s;
    }

    .btn-cancelar:hover { border-color: #bdbdbd; background: #f5f5f5; }

    .btn-guardar { display: flex; align-items: center; gap: 7px; padding: 0.55rem 1.4rem; background: #1e8c34; color: #fff; border: none; border-radius: 9px; font-size: 0.85rem; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; transition: background 0.15s, transform 0.1s; box-shadow: 0 3px 10px rgba(30,140,52,0.3); }

    .btn-guardar:hover:not(:disabled) { background: #145a24; transform: translateY(-1px); }
    .btn-guardar:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-guardar mat-icon { font-size: 17px !important; width: 17px !important; height: 17px !important; }
    
    /* Responsive: compacto y mobile-friendly */
    @media (max-width: 480px) {
      .dialogo-cabecera { gap: 8px; padding: 8px 10px; }
      .dialogo-cabecera-icono { width: 40px; height: 40px; }
      .dialogo-titulo { font-size: 0.98rem; }
      .dialogo-subtitulo { font-size: 0.66rem; }

      .dialogo-cuerpo { padding: 10px !important; }
      .dialogo-form { gap: 6px; }
      .campos-fila { grid-template-columns: 1fr; gap: 8px; }

      .campo-input { height: 36px; padding: 0 10px 0 34px; font-size: 0.82rem; }
      .campo-icono { left: 10px; font-size: 14px !important; }

      .dialogo-acciones { padding: 8px 10px !important; gap: 8px !important; }
      .btn-cancelar, .btn-guardar { padding: 0.45rem 0.9rem; font-size: 0.82rem; }
    }
  `],
})
export class VehiculoFormDialogo {
  formulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<VehiculoFormDialogo>,
    @Inject(MAT_DIALOG_DATA) public datos: DatosVehiculoDialogo,
    private snack: MatSnackBar,
  ) {
    const v = datos.vehiculo;
    this.formulario = this.fb.group({
      placa:       [v?.placa ?? '',       [Validators.required, Validators.pattern(/^[A-Za-z]{3}-\d{3}$/)]],
      marca:       [v?.marca ?? '',       Validators.required],
      modelo:      [v?.modelo ?? '',      Validators.required],
      capacidad_kg:[v?.capacidad_kg ?? null],
      estado:      [v?.estado ?? 'operativo'],
    });

    // Normalizar placa a mayúsculas y auto-insertar guion (AAA-123)
    const placaControl = this.formulario.get('placa');
    if (placaControl) {
      placaControl.valueChanges.subscribe((val: any) => {
        let s = (val ?? '').toString();
        // Mantener solo letras y números
        let sanitized = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
        // Limitar a 6 caracteres (3 letras + 3 números)
        if (sanitized.length > 6) sanitized = sanitized.slice(0, 6);
        // Insertar guion después de las 3 primeras letras si hay más caracteres
        const formatted = sanitized.length > 3 ? sanitized.slice(0, 3) + '-' + sanitized.slice(3) : sanitized;
        if (formatted !== s) {
          placaControl.setValue(formatted, { emitEvent: false });
        }
      });
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      const placaCtrl = this.formulario.get('placa');
      if (placaCtrl?.hasError('pattern')) {
        this.snack.open('Formato inválido', 'Cerrar', { duration: 3500 });
      }
      return;
    }
    this.dialogRef.close(this.formulario.value);
  }
}
