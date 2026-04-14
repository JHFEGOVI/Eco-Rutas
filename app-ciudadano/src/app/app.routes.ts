import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'rutas',
    pathMatch: 'full'
  },
  {
    path: 'rutas',
    loadComponent: () => import('./paginas/rutas/rutas.pagina').then(m => m.RutasCiudadanoPagina)
  },
  {
    path: 'mapa/:id',
    loadComponent: () => import('./paginas/mapa/mapa.pagina').then(m => m.MapaCiudadanoPagina)
  }
];
