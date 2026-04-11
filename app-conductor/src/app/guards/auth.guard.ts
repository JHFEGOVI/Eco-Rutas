import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServicio } from '../servicios/auth.servicio';

export const authGuard: CanActivateFn = async (route, state) => {
  const authServicio = inject(AuthServicio);
  const router = inject(Router);

  const autenticado = await authServicio.estaAutenticado();

  if (autenticado) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
