import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { GalleryProgressService } from '../services/gallery-progress.service';

export const comicAccessGuard: CanActivateFn = route => {
  const routeId = route.paramMap.get('id') ?? route.routeConfig?.path?.match(/comic\/(\d+)/)?.[1];
  const comicId = Number(routeId);
  const progress = inject(GalleryProgressService);
  const router = inject(Router);

  return progress.obtenerDesbloqueados().pipe(
    map(desbloqueados => desbloqueados.includes(comicId)
      ? true
      : router.createUrlTree(['/galeria'])),
    catchError(() => of(router.createUrlTree(['/galeria'])))
  );
};
