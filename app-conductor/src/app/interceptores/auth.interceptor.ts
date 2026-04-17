import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { AuthServicio } from '../servicios/auth.servicio';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServicio = inject(AuthServicio);
  const router = inject(Router);

  // Convertimos la promesa del token a observable para interceptar todo de forma asincrona
  return from(authServicio.obtenerToken()).pipe(
    switchMap(token => {
      let peticion = req;
      if (token) {
        peticion = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }
      return next(peticion).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            authServicio.cerrarSesion();
            router.navigate(['/login'], { replaceUrl: true });
          }
          return throwError(() => error);
        })
      );
    })
  );
};
