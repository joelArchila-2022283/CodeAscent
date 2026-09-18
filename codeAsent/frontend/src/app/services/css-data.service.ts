import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ILenguaje } from '../interfaces/lenguaje.interface';
import { INivel } from '../interfaces/nivel.interface';
import { IProgreso } from '../interfaces/progreso.interface';
import { ILeccion } from '../interfaces/leccion.interface';

const NOMBRE_LENGUAJE_CSS = 'css';

interface RespuestaLenguajes { exito: boolean; datos: ILenguaje[]; }
interface RespuestaNiveles { status: string; data: INivel[]; }
interface RespuestaProgreso { status: string; data: IProgreso; }
interface RespuestaLecciones { status: string; data: ILeccion[]; }

export interface ContextoCSS {
  idLenguaje: number;
  niveles: INivel[];
  nivelActual: INivel | null;
  progreso: IProgreso | null;
}

export interface LeccionesNivelCSS {
  nivel: INivel | null;
  lecciones: ILeccion[];
}

@Injectable({ providedIn: 'root' })
export class CssDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  obtenerContexto(): Observable<ContextoCSS> {
    return this.http.get<RespuestaLenguajes>(`${this.apiUrl}/lenguajes`).pipe(
      switchMap(respuesta => {
        const lenguajeCSS = (respuesta.datos || []).find(
          lenguaje => lenguaje.nombre?.toLowerCase() === NOMBRE_LENGUAJE_CSS
        );

        if (!lenguajeCSS?.id_lenguaje) {
          throw new Error('El lenguaje CSS no está configurado en la base de datos.');
        }

        const idLenguaje = lenguajeCSS.id_lenguaje;
        const idUsuario = this.authService.obtenerIdUsuario();

        const niveles$ = this.http.get<RespuestaNiveles>(
          `${this.apiUrl}/niveles/lenguaje/${idLenguaje}`
        );

        const progreso$: Observable<IProgreso | null> = idUsuario
          ? this.http.get<RespuestaProgreso>(
              `${this.apiUrl}/progresos/usuario/${idUsuario}/lenguaje/${idLenguaje}`
            ).pipe(map(r => r.data), catchError(() => of(null)))
          : of(null);

        return forkJoin({ niveles: niveles$, progreso: progreso$ }).pipe(
          map(({ niveles, progreso }) => {
            const lista = niveles.data || [];
            const nivelActual =
              (progreso?.id_nivel_actual
                ? lista.find(n => n.id_nivel === progreso.id_nivel_actual)
                : null) ?? lista[0] ?? null;

            return { idLenguaje, niveles: lista, nivelActual, progreso };
          })
        );
      })
    );
  }

  obtenerLeccionesNivelActual(): Observable<LeccionesNivelCSS> {
    return this.obtenerContexto().pipe(
      switchMap(contexto => {
        if (!contexto.nivelActual?.id_nivel) {
          return of({ nivel: null, lecciones: [] });
        }
        return this.http.get<RespuestaLecciones>(
          `${this.apiUrl}/lecciones/nivel/${contexto.nivelActual.id_nivel}`
        ).pipe(
          map(r => ({ nivel: contexto.nivelActual, lecciones: r.data || [] })),
          catchError(() => of({ nivel: contexto.nivelActual, lecciones: [] }))
        );
      })
    );
  }
}
