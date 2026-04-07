import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  template: `
    <h2 mat-dialog-title>{{ datos.vehiculo ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="formulario" class="formulario">

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Placa</mat-label>
          <input matInput formControlName="placa" />
          @if (formulario.get('placa')?.hasError('required') && formulario.get('placa')?.touched) {
            <mat-error>La placa es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Marca</mat-label>
          <input matInput formControlName="marca" />
          @if (formulario.get('marca')?.hasError('required') && formulario.get('marca')?.touched) {
            <mat-error>La marca es requerida</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Modelo</mat-label>
          <input matInput formControlName="modelo" />
          @if (formulario.get('modelo')?.hasError('required') && formulario.get('modelo')?.touched) {
            <mat-error>El modelo es requerido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Capacidad (kg)</mat-label>
          <input matInput type="number" formControlName="capacidad_kg" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="campo">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="estado">
            <mat-option value="operativo">Operativo</mat-option>
            <mat-option value="averiado">Averiado</mat-option>
            <mat-option value="inactivo">Inactivo</mat-option>
          </mat-select>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .formulario { display: flex; flex-direction: column; min-width: 340px; padding-top: 8px; }
    .campo { width: 100%; }
  `],
})
export class VehiculoFormDialogo {
  formulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<VehiculoFormDialogo>,
    @Inject(MAT_DIALOG_DATA) public datos: DatosVehiculoDialogo,
  ) {
    const v = datos.vehiculo;
    this.formulario = this.fb.group({
      placa:       [v?.placa ?? '',       Validators.required],
      marca:       [v?.marca ?? '',       Validators.required],
      modelo:      [v?.modelo ?? '',      Validators.required],
      capacidad_kg:[v?.capacidad_kg ?? null],
      estado:      [v?.estado ?? 'operativo'],
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.formulario.value);
  }
}
