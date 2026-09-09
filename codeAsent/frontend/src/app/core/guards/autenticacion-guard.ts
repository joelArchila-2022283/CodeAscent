import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../../services/auth.service';

export const autenticacionGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.Autenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};