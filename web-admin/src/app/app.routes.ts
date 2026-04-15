import { Routes } from '@angular/router';
import { LoginComponente } from './paginas/login/login.componente';
import { ForgotPasswordComponente } from './paginas/recuperar-password/forgot-password.componente';
import { DashboardComponente } from './paginas/dashboard/dashboard.componente';
import { InicioComponente } from './paginas/dashboard/inicio.componente';
import { VehiculosComponente } from './paginas/vehiculos/vehiculos.componente';
import { ConductoresComponente } from './paginas/conductores/conductores.componente';
import { RutasComponente } from './paginas/rutas/rutas.componente';
import { AsignacionesComponente } from './paginas/asignaciones/asignaciones.componente';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponente },
  { path: 'forgot-password', component: ForgotPasswordComponente },
  { path: 'reset-password', redirectTo: 'forgot-password', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponente,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponente },
      { path: 'vehiculos',    component: VehiculosComponente },
      { path: 'conductores',  component: ConductoresComponente },
      { path: 'rutas',        component: RutasComponente },
      { path: 'asignaciones', component: AsignacionesComponente },
    ],
  },
  { path: '**', redirectTo: 'login' },
];