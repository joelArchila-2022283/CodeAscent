import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { RetoService } from './ts-reto.service';
import { ILenguaje } from '../interfaces/lenguaje.interface';
import { INivel } from '../interfaces/nivel.interface';
import { ILeccion } from '../interfaces/leccion.interface';
import { IProgreso } from '../interfaces/progreso.interface';
import { IReto } from '../interfaces/reto.interface';
import { MissionProgressService } from '../core/services/mission-progress.service';

interface RespuestaLenguajes { datos: ILenguaje[]; }
interface RespuestaNiveles { data: INivel[]; }
interface RespuestaProgreso { data: IProgreso; }

export interface HtmlContexto {
  idLenguaje: number;
  niveles: INivel[];
  nivelActual: INivel | null;
  progreso: IProgreso | null;
}

export interface HtmlMision {
  nivel: INivel;
  leccion: ILeccion | null;
  reto: IReto | null;
  completada: boolean;
  desbloqueada: boolean;
}

export interface HtmlQuizQuestion {
  id_reto: number;
  enunciado: string;
  xp_recompensa: number;
  respuestas: Array<{
    id_respuesta: number;
    texto_respuesta: string;
    es_correcta: boolean;
  }>;
}

@Injectable({ providedIn: 'root' })
export class HtmlDataService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly retoService = inject(RetoService);
  private readonly missionProgressService = inject(MissionProgressService);
  private readonly apiUrl = environment.apiUrl;

  obtenerContexto(): Observable<HtmlContexto> {
    return this.http.get<RespuestaLenguajes>(`${this.apiUrl}/lenguajes`).pipe(
      switchMap(respuesta => {
        const lenguaje = (respuesta.datos || []).find(
          item => item.nombre?.toLowerCase() === 'html'
        );

        if (!lenguaje?.id_lenguaje) {
          throw new Error('El lenguaje HTML no está configurado en la base de datos.');
        }

        const idLenguaje = lenguaje.id_lenguaje;
        const idUsuario = this.authService.obtenerIdUsuario();
        const niveles$ = this.http.get<RespuestaNiveles>(
          `${this.apiUrl}/niveles/lenguaje/${idLenguaje}`
        );
        const progreso$ = idUsuario
          ? this.http.get<RespuestaProgreso>(
              `${this.apiUrl}/progresos/usuario/${idUsuario}/lenguaje/${idLenguaje}`
            ).pipe(map(res => res.data), catchError(() => of(null)))
          : of(null);

        return forkJoin({ niveles: niveles$, progreso: progreso$ }).pipe(
          map(({ niveles, progreso }) => {
            const lista = (niveles.data || []).sort(
              (a, b) => a.numero_nivel - b.numero_nivel
            );
            const nivelActual = (progreso?.id_nivel_actual
              ? lista.find(nivel => nivel.id_nivel === progreso.id_nivel_actual)
              : null) ?? lista[0] ?? null;
            return { idLenguaje, niveles: lista, nivelActual, progreso };
          })
        );
      })
    );
  }

  obtenerMisiones(): Observable<HtmlMision[]> {
    return this.obtenerContexto().pipe(
      switchMap(contexto => {
        const niveles = contexto.niveles.filter(nivel => nivel.id_nivel);
        if (!niveles.length) return of([]);

            return forkJoin(niveles.map(nivel =>
          this.http.get<{ status: string; data: ILeccion[] }>(
            `${this.apiUrl}/lecciones/nivel/${nivel.id_nivel}`
          ).pipe(
            map(respuesta => ({ nivel, leccion: respuesta.data?.[0] ?? null })),
            catchError(() => of({ nivel, leccion: null }))
          )
        )).pipe(
          switchMap(grupos => {
            const conLecciones = grupos.filter(item => item.leccion?.id_leccion);
            return forkJoin(conLecciones.map(item =>
              this.retoService.obtenerRetosDeLecciones([item.leccion!.id_leccion!]).pipe(
                map(retos => ({ ...item, reto: retos[0] ?? null })),
                catchError(() => of({ ...item, reto: null }))
              )
            )).pipe(
              switchMap(misiones => forkJoin(misiones.map(item =>
                item.reto?.id_leccion
                  ? this.missionProgressService.getProgress(item.reto.id_leccion).pipe(map(res => ({ ...item, progresoMision: res.data })))
                  : of({ ...item, progresoMision: null })
              )).pipe(
                map(misionesConProgreso => niveles.map(nivel => {
                  const mision = misionesConProgreso.find(item => item.nivel.id_nivel === nivel.id_nivel);
                  const retoId = mision?.reto?.id_reto;
                  const completada = mision?.progresoMision?.completed === true;
                  const anterior = niveles.find(item => item.numero_nivel === nivel.numero_nivel - 1);
                  const anteriorMision = misionesConProgreso.find(item => item.nivel.id_nivel === anterior?.id_nivel);
                  const desbloqueada = nivel.numero_nivel === 1 ||
                    anteriorMision?.progresoMision?.completed === true;
                  return {
                    nivel,
                    leccion: mision?.leccion ?? null,
                    reto: mision?.reto ?? null,
                    completada,
                    desbloqueada
                  };
                }))
              ))
            );
          })
        );
      })
    );
  }

  obtenerLeccionActual(): Observable<ILeccion | null> {
    return this.obtenerContexto().pipe(
      switchMap(contexto => {
        if (!contexto.nivelActual?.id_nivel) return of(null);
        return this.http.get<{ status: string; data: ILeccion[] }>(
          `${this.apiUrl}/lecciones/nivel/${contexto.nivelActual.id_nivel}`
        ).pipe(
          map(respuesta => respuesta.data?.[0] ?? null),
          catchError(() => of(null))
        );
      })
    );
  }

  obtenerCuestionario(idLeccion: number): Observable<HtmlQuizQuestion[]> {
    return this.http.get<{ status: string; data: HtmlQuizQuestion[] }>(
      `${this.apiUrl}/missions/${idLeccion}/quiz`
    ).pipe(
      map(respuesta => respuesta.data ?? []),
      catchError(() => of([]))
    );
  }
}
