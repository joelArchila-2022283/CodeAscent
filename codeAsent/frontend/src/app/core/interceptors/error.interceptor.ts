import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // status 0: el navegador no pudo comunicarse con el servidor.
      if (error.status === 0) {
        void router.navigate(['/error/offline']);
      } else if (error.status === 403) {
        void router.navigate(['/error/403']);
      } else if (error.status >= 500) {
        void router.navigate(['/error/500']);
      }

      // 401 se deja al flujo de autenticación para no convertir
      // credenciales incorrectas del login en una página global de error.
      return throwError(() => error);
    })
  );
};
