import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
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
  ],
  template: `
    <h2 mat-dialog-title>Nueva asignación</h2>

    <mat-dialog-content>
      <form [formGroup]="formulario" class="formulario">

        <!-- Selector de Conductor -->
        <mat-form-field appearance="outline" class="campo">
          <mat-label>Conductor</mat-label>
          <mat-select formControlName="conductor_id">
            @for (c of conductores; track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }} ({{ c.documento }})</mat-option>
            }
          </mat-select>
          @if (formulario.get('conductor_id')?.hasError('required') && formulario.get('conductor_id')?.touched) {
            <mat-error>Debes elegir un conductor</mat-error>
          }
        </mat-form-field>

        <!-- Selector de Ruta -->
        <mat-form-field appearance="outline" class="campo">
          <mat-label>Ruta</mat-label>
          <mat-select formControlName="ruta_id">
            @for (r of rutas; track r.id) {
              <mat-option [value]="r.id">{{ r.nombre }}</mat-option>
            }
          </mat-select>
          @if (formulario.get('ruta_id')?.hasError('required') && formulario.get('ruta_id')?.touched) {
            <mat-error>Debes elegir una ruta</mat-error>
          }
        </mat-form-field>

        <!-- Datepicker nativo para Fecha -->
        <mat-form-field appearance="outline" class="campo">
          <mat-label>Fecha de asignación</mat-label>
          <input matInput type="date" formControlName="fecha" />
          @if (formulario.get('fecha')?.hasError('required') && formulario.get('fecha')?.touched) {
            <mat-error>La fecha es obligatoria</mat-error>
          }
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .formulario { display: flex; flex-direction: column; min-width: 360px; padding-top: 8px; }
    .campo { width: 100%; margin-bottom: 8px; }
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
