import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface DatosConfirmar {
  titulo: string;
  mensaje: string;
  icon?: string | null;
  confirmColor?: 'red' | 'green' | 'amber';
}

@Component({
  selector: 'app-confirmar-dialogo',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialogo-cuerpo">
      <div *ngIf="data.icon !== null" class="icono-circulo"
        [ngStyle]="{ 'background': color === 'green' ? '#e8f5e9' : (color === 'amber' ? '#fdecea' : '#fdecea') }">
        <mat-icon [ngStyle]="{ 'color': color === 'green' ? '#2e7d32' : (color === 'amber' ? '#c62828' : '#c62828') }">
          {{ data.icon || 'warning_amber' }}
        </mat-icon>
      </div>
      <h2 class="dialogo-titulo">{{ data.titulo }}</h2>
      <p class="dialogo-mensaje">{{ data.mensaje }}</p>
    </div>

    <mat-dialog-actions class="dialogo-acciones">
      <button class="btn-cancelar" mat-dialog-close>Cancelar</button>
      <button class="btn-confirmar"
        [ngClass]="{
          'btn-confirmar--green': color === 'green',
          'btn-confirmar--amber': color === 'amber',
          'btn-confirmar--red': color === 'red'
        }"
        (click)="confirmar()">Confirmar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

    :host { font-family: 'Nunito', sans-serif; display: block; }

    .dialogo-cuerpo {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem 1.75rem 1.25rem;
      gap: 10px;
    }

    .icono-circulo {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .icono-circulo mat-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
    }

    .dialogo-titulo {
      font-size: 1rem;
      font-weight: 900;
      color: #111;
      margin: 0;
    }

    .dialogo-mensaje {
      font-size: 0.82rem;
      color: #666;
      line-height: 1.6;
      margin: 0;
      max-width: 260px;
    }

    .dialogo-acciones {
      display: flex !important;
      gap: 10px !important;
      padding: 0 1.75rem 1.5rem !important;
      justify-content: stretch !important;
    }

    .btn-cancelar {
      flex: 1;
      padding: 0.6rem;
      background: #f5f5f5;
      border: none;
      border-radius: 9px;
      font-size: 0.82rem;
      font-weight: 700;
      color: #555;
      cursor: pointer;
      font-family: 'Nunito', sans-serif;
      transition: background 0.15s;
    }

    .btn-cancelar:hover { background: #eee; }

    .btn-confirmar {
      flex: 1;
      padding: 0.6rem;
      color: #fff;
      border: none;
      border-radius: 9px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Nunito', sans-serif;
      transition: background 0.15s, transform 0.1s;
    }

    .btn-confirmar--red { background: #c62828; box-shadow: 0 3px 10px rgba(198,40,40,0.25); }
    .btn-confirmar--red:hover { background: #b71c1c; }

    .btn-confirmar--green { background: #2e7d32; box-shadow: 0 3px 10px rgba(46,125,50,0.25); }
    .btn-confirmar--green:hover { background: #1b5e20; }

    .btn-confirmar--amber { background: #ffb300; box-shadow: 0 3px 10px rgba(255,179,0,0.18); }
    .btn-confirmar--amber:hover { background: #ff9800; }

    .btn-confirmar:hover { transform: translateY(-1px); }
  `],
})
export class ConfirmarDialogo {
  get color(): 'red' | 'green' | 'amber' { return (this.data?.confirmColor as any) ?? 'red'; }
  constructor(
    public dialogRef: MatDialogRef<ConfirmarDialogo>,
    @Inject(MAT_DIALOG_DATA) public data: DatosConfirmar,
  ) {}

  confirmar(): void {
    this.dialogRef.close(true);
  }
}
