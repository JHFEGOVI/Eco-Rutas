import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./paginas/login/login.componente').then((m) => m.LoginComponente),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./paginas/dashboard/dashboard.componente').then((m) => m.DashboardComponente),
    canActivate: [authGuard],
    children: [
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./paginas/vehiculos/vehiculos.componente').then((m) => m.VehiculosComponente),
        canActivate: [authGuard],
      },
      {
        path: 'conductores',
        loadComponent: () =>
          import('./paginas/conductores/conductores.componente').then((m) => m.ConductoresComponente),
        canActivate: [authGuard],
      },
      {
        path: 'rutas',
        loadComponent: () =>
          import('./paginas/rutas/rutas.componente').then((m) => m.RutasComponente),
        canActivate: [authGuard],
      },
      {
        path: 'asignaciones',
        loadComponent: () =>
          import('./paginas/asignaciones/asignaciones.componente').then((m) => m.AsignacionesComponente),
        canActivate: [authGuard],
      },
      { path: '', redirectTo: 'vehiculos', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
