import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

type MissionReference = { id_leccion: number };
type ProgressReference = { reached_step: string };

export const languageStepGuard: CanActivateFn = route => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const lang = route.paramMap.get('lang');
  const missionId = Number(route.paramMap.get('missionId'));
  const currentStep = route.url.at(-1)?.path ?? 'manual';

  if (!lang || !Number.isInteger(missionId) || missionId <= 0) {
    return router.parseUrl('/dashboard');
  }

  return http.get<{ data: MissionReference[] }>(`${environment.apiUrl}/languages/${lang}/missions`).pipe(
    switchMap(response => {
      const belongsToLanguage = response.data.some(
        (mission: MissionReference) => mission.id_leccion === missionId
      );
      if (!belongsToLanguage) return of(router.parseUrl(`/${lang}`));

      return http.get<{ data: ProgressReference }>(`${environment.apiUrl}/missions/${missionId}/progress`).pipe(
        map(progressResponse => {
          const reachedStep = progressResponse.data?.reached_step ?? 'manual';
          const steps = ['manual', 'lesson', 'terminal', 'quiz'];
          if (steps.indexOf(currentStep) > steps.indexOf(reachedStep)) {
            return router.parseUrl(`/${lang}/missions/${missionId}/${reachedStep}`);
          }
          return true;
        })
      );
    }),
    catchError(() => of(router.parseUrl('/dashboard')))
  );
};
