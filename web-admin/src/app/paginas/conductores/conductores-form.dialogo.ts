import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface DatosConductorDialogo {
  conductor?: {
    id: string;
    nombre: string;
    documento: string;
    email: string;
    username: string;
    rol: string;
    activo: boolean;
  };
}

@Component({
  selector: 'app-conductores-form-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <div class="dialogo-cabecera">
      <div class="dialogo-cabecera-icono">
        <mat-icon>person_add</mat-icon>
      </div>
      <div class="dialogo-cabecera-texto">
        <h2 class="dialogo-titulo">{{ esEdicion ? 'Editar conductor' : 'Nuevo conductor' }}</h2>
        <p class="dialogo-subtitulo">Completa los datos del conductor</p>
      </div>
    </div>

    <mat-dialog-content class="dialogo-cuerpo">
      <form [formGroup]="form" class="dialogo-form">

        <div class="campo-grupo">
          <label class="campo-label">Nombre completo</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">person</mat-icon>
            <input class="campo-input" formControlName="nombre" placeholder="Nombre completo" autocomplete="off" />
          </div>
          @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>El nombre es requerido</span>
          }
        </div>

        <div class="campo-grupo">
          <label class="campo-label">Documento</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">badge</mat-icon>
            <input class="campo-input" formControlName="documento" placeholder="Documento" autocomplete="off" />
          </div>
          @if (form.get('documento')?.hasError('required') && form.get('documento')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>El documento es requerido</span>
          }
        </div>

        <div class="campo-grupo">
          <label class="campo-label">Correo electrónico</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">email</mat-icon>
            <input class="campo-input" formControlName="email" placeholder="Correo electrónico" autocomplete="off" />
          </div>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>El correo es requerido</span>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>Correo inválido</span>
          }
        </div>

        <div class="campo-grupo">
          <label class="campo-label">Usuario</label>
          <div class="campo-wrap">
            <mat-icon class="campo-icono">account_circle</mat-icon>
            <input class="campo-input" formControlName="username" placeholder="Usuario" autocomplete="off" />
          </div>
          @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>El usuario es requerido</span>
          }
        </div>

        @if (!esEdicion) {
          <div class="campo-grupo">
            <label class="campo-label">Contraseña</label>
            <div class="campo-wrap">
              <mat-icon class="campo-icono">lock</mat-icon>
              <input class="campo-input" type="password" formControlName="password" placeholder="Contraseña" autocomplete="new-password" />
            </div>
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>La contraseña es requerida</span>
            }
            @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
              <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>Mínimo 6 caracteres</span>
            }
          </div>
        }

        <div class="campo-grupo">
          <label class="campo-label">Rol</label>
          <div class="campo-wrap campo-wrap--select">
            <mat-icon class="campo-icono">how_to_reg</mat-icon>
            <select class="campo-input campo-select" formControlName="rol">
              <option value="conductor">Conductor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          @if (form.get('rol')?.hasError('required') && form.get('rol')?.touched) {
            <span class="campo-error"><mat-icon class="error-icono">error_outline</mat-icon>El rol es requerido</span>
          }
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions class="dialogo-acciones">
      <button class="btn-cancelar" mat-dialog-close>Cancelar</button>
      <button class="btn-guardar" (click)="guardar()" [disabled]="form.invalid">
        <mat-icon>check</mat-icon>
        {{ esEdicion ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

    :host { font-family: 'Nunito', sans-serif; display: block; }

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

    .dialogo-cabecera-icono mat-icon { font-size: 26px !important; color: #fff; }

    .dialogo-titulo { font-size: 1.05rem; font-weight: 900; color: #fff; margin: 0 0 2px; }
    .dialogo-subtitulo { font-size: 0.72rem; color: rgba(255,255,255,0.85); margin: 0; }

    .dialogo-cuerpo { padding: 12px 12px 8px !important; max-height: none; overflow-y: visible; }

    .dialogo-form { display: flex; flex-direction: column; gap: 8px; }

    .campo-grupo { display: flex; flex-direction: column; gap: 5px; }

    .campo-label { font-size: 0.65rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.8px; }

    .campo-wrap { position: relative; display: flex; align-items: center; }

    .campo-icono { position: absolute; left: 10px; font-size: 15px !important; color: #bdbdbd; }

    .campo-input { width: 100%; height: 40px; padding: 0 12px 0 36px; border: 1px solid #e8e8e8; border-radius: 8px; background: #fafafa; font-size: 0.83rem; }

    .campo-input::placeholder { color: #bdbdbd; }
    .campo-input:focus { border-color: #1e8c34; background: #fff; box-shadow: 0 0 0 3px rgba(30,140,52,0.12); }
    .campo-wrap:focus-within .campo-icono { color: #1e8c34; }

    .campo-wrap--select::after { content: ''; position: absolute; right: 14px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #9e9e9e; }
    .campo-select { appearance: none; cursor: pointer; }

    .campo-error { display: flex; align-items: center; gap: 4px; font-size: 0.68rem; color: #e53935; padding-left: 2px; }
    .error-icono { font-size: 13px !important; }

    .dialogo-acciones { display: flex !important; justify-content: flex-end !important; gap: 8px !important; padding: 10px 12px !important; border-top: 1px solid #f0f0f0; margin: 0; }

    .btn-cancelar { padding: 0.55rem 1.25rem; background: transparent; border: 1.5px solid #e0e0e0; border-radius: 9px; font-size: 0.82rem; font-weight: 700; color: #555; cursor: pointer; }

    .btn-guardar { display: flex; align-items: center; gap: 7px; padding: 0.55rem 1.4rem; background: #1e8c34; color: #fff; border: none; border-radius: 9px; font-size: 0.85rem; font-weight: 700; cursor: pointer; box-shadow: 0 3px 10px rgba(30,140,52,0.3); }
    .btn-guardar:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class ConductoresFormDialogo implements OnInit {
  form!: FormGroup;
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConductoresFormDialogo>,
    @Inject(MAT_DIALOG_DATA) public datos: DatosConductorDialogo,
  ) {}

  ngOnInit(): void {
    this.esEdicion = !!this.datos?.conductor;

    this.form = this.fb.group({
      nombre:    [this.datos?.conductor?.nombre   ?? '', Validators.required],
      documento: [this.datos?.conductor?.documento ?? '', Validators.required],
      email:     [this.datos?.conductor?.email    ?? '', [Validators.required, Validators.email]],
      username:  [this.datos?.conductor?.username ?? '', Validators.required],
      password:  ['', this.esEdicion ? [] : [Validators.required, Validators.minLength(6)]],
      rol:       [this.datos?.conductor?.rol      ?? 'conductor', Validators.required],
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = { ...this.form.value };

    // No enviar password en edición
    if (this.esEdicion) {
      delete datos['password'];
    }

    this.dialogRef.close(datos);
  }
}
