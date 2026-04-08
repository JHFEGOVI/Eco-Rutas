import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Cambiar estado</h2>
    <mat-dialog-content>
      <p>Seleccione el nuevo estado para esta asignación:</p>
      
      <form [formGroup]="formulario" class="formulario">
        <mat-form-field appearance="outline" class="campo">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="nuevoEstado">
            <mat-option value="pendiente">Pendiente</mat-option>
            <mat-option value="en_curso">En curso</mat-option>
            <mat-option value="completada">Completada</mat-option>
            <mat-option value="cancelada">Cancelada</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="formulario.invalid" (click)="guardar()">Continuar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .formulario { padding-top: 10px; min-width: 260px;}
    .campo { width: 100%; }
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
