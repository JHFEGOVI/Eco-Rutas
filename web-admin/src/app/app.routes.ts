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
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
