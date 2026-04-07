import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

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
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar conductor' : 'Nuevo conductor' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-contenedor">

        <mat-form-field appearance="outline">
          <mat-label>Nombre completo</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej. Juan Pérez" />
          @if (form.get('nombre')?.hasError('required') && form.get('nombre')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Documento</mat-label>
          <input matInput formControlName="documento" placeholder="Ej. 1234567890" />
          @if (form.get('documento')?.hasError('required') && form.get('documento')?.touched) {
            <mat-error>El documento es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Correo electrónico</mat-label>
          <input matInput formControlName="email" type="email" placeholder="Ej. juan@correo.com" />
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>El correo es requerido</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Correo inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Usuario</mat-label>
          <input matInput formControlName="username" placeholder="Ej. jperez" />
          @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
            <mat-error>El usuario es requerido</mat-error>
          }
        </mat-form-field>

        @if (!esEdicion) {
          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input matInput formControlName="password" type="password" />
            @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
              <mat-error>La contraseña es requerida</mat-error>
            }
            @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
              <mat-error>Mínimo 6 caracteres</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rol">
            <mat-option value="conductor">Conductor</mat-option>
            <mat-option value="admin">Administrador</mat-option>
          </mat-select>
          @if (form.get('rol')?.hasError('required') && form.get('rol')?.touched) {
            <mat-error>El rol es requerido</mat-error>
          }
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid">
        {{ esEdicion ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-contenedor {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 380px;
      padding-top: 8px;
    }

    mat-form-field {
      width: 100%;
    }
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
