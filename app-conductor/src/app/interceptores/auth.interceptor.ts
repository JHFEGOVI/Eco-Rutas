import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthServicio } from '../servicios/auth.servicio';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServicio = inject(AuthServicio);

  // Convertimos la promesa del token a observable para interceptar todo de forma asincrona
  return from(authServicio.obtenerToken()).pipe(
    switchMap(token => {
      if (token) {
        const peticionActualizada = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(peticionActualizada);
      }
      return next(req);
    })
  );
};
