import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'rutas',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login.pagina').then((m) => m.LoginPagina),
  },
  {
    path: 'rutas',
    loadComponent: () => import('./paginas/rutas/rutas.pagina').then((m) => m.RutasPagina),
    canActivate: [authGuard]
  },
  {
    path: 'recorrido/:id',
    loadComponent: () => import('./paginas/recorrido/recorrido.pagina').then((m) => m.RecorridoPagina),
    canActivate: [authGuard]
  }
];
