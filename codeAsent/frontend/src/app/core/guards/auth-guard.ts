import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Protege las rutas privadas (ej. Dashboard, Mapa)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true; // Déjalo pasar
  } else {
    router.navigate(['/login']); // Patada al login
    return false;
  }
};

// Protege las rutas públicas (ej. Login, Registro)
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    // ¡Aquí ocurre la magia del Recordarme! 
    // Si ya tiene token, lo manda directo adentro sin mostrar el login.
    router.navigate(['/dashboard']); 
    return false; 
  }
  return true; // Déjalo ver el login
};