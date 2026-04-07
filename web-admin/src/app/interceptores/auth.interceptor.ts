import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthServicio } from '../servicios/auth.servicio';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthServicio);
  const token = auth.obtenerToken();

  if (token) {
    const reqConToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(reqConToken);
  }

  return next(req);
};
