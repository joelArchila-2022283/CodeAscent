import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { RetoService } from './ts-reto.service';
import { ILenguaje } from '../interfaces/lenguaje.interface';
import { INivel } from '../interfaces/nivel.interface';
import { IProgreso } from '../interfaces/progreso.interface';
import { ILeccion } from '../interfaces/leccion.interface';
import { LeccionCss, NivelCss } from '../interfaces/css.interface';
import { IReto } from '../interfaces/reto.interface';
import { CssLocalProgressService } from '../core/services/css-local-progress.service';

const NOMBRE_LENGUAJE_CSS = 'css';

interface RespuestaLenguajes { exito: boolean; datos: ILenguaje[]; }
interface RespuestaNiveles { status: string; data: INivel[]; }
interface RespuestaProgreso { status: string; data: IProgreso; }
interface RespuestaLecciones { status: string; data: ILeccion[]; }
interface RespuestaNivelesCss { status: string; data: NivelCss[]; }

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


export interface ResultadoIntentoCss {
  correcto: boolean;
  xp_obtenida: number;
  ya_completado: boolean;
  progreso: IProgreso | null;
}

export interface CssMision {
  nivel: NivelCss;
  leccion: LeccionCss | null;
  reto: IReto | null;
  completada: boolean;
  desbloqueada: boolean;
}

export interface CssQuizQuestion {
  id_reto: number;
  enunciado: string;
  xp_recompensa: number;
  respuestas: Array<{
    id_respuesta: number;
    texto_respuesta: string;
    es_correcta: boolean;
  }>;
}

export interface CssHint { id_pista: number; orden: number; texto: string; }

interface RespuestaIntentoCss {
  status: string;
  data: ResultadoIntentoCss;
}

@Injectable({ providedIn: 'root' })
export class CssDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private retoService = inject(RetoService);
  private localProgress = inject(CssLocalProgressService);
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

  obtenerNivelesPedagogicos(): Observable<NivelCss[]> {
    return this.http.get<RespuestaNivelesCss>(`${this.apiUrl}/css/niveles`).pipe(
      map(respuesta => respuesta.data || [])
    );
  }

  obtenerMisionesCss(): Observable<CssMision[]> {
    return forkJoin({
      niveles: this.obtenerNivelesPedagogicos(),
      completadas: this.retoService.obtenerRetosCompletados()
    }).pipe(
      map(({ niveles, completadas }) => {
          const ordenados = [...niveles].sort((a, b) => a.numero_nivel - b.numero_nivel);
          const local = this.localProgress.read();
          return ordenados.map((nivel, index) => {
            const leccion = nivel.lecciones?.[0] ?? null;
            const reto = nivel.retos?.find(item => item.tipo_reto === 'codigo') ?? null;
            const cuestionarios = nivel.retos?.filter(item => item.tipo_reto === 'opcion_multiple') ?? [];
            const completadaServidor = cuestionarios.length > 0 && cuestionarios.every(item => item.id_reto !== undefined && completadas.has(item.id_reto));
            const completada = completadaServidor || local.completedMissionIds.includes(nivel.id_nivel);
            const anterior = ordenados[index - 1];
            const anteriorCuestionarios = anterior?.retos?.filter(item => item.tipo_reto === 'opcion_multiple') ?? [];
            const anteriorCompletadaServidor = anteriorCuestionarios.length > 0 && anteriorCuestionarios.every(item => item.id_reto !== undefined && completadas.has(item.id_reto));
            const anteriorCompletada = anteriorCompletadaServidor || local.completedMissionIds.includes(anterior?.id_nivel ?? 0);
            return {
              nivel,
              leccion,
              reto,
              completada,
              desbloqueada: index === 0 || anteriorCompletada
            } satisfies CssMision;
          });
      })
    );
  }

  obtenerCuestionario(idLeccion: number): Observable<CssQuizQuestion[]> {
    return this.http.get<{ status: string; data: CssQuizQuestion[] }>(
      `${this.apiUrl}/missions/${idLeccion}/quiz`
    ).pipe(
      map(respuesta => respuesta.data ?? []),
      catchError(() => of([]))
    );
  }

  obtenerPistas(idLeccion: number): Observable<CssHint[]> {
    return this.http.get<{ status: string; data: { pistas?: CssHint[] } }>(
      `${this.apiUrl}/missions/${idLeccion}/lab`
    ).pipe(
      map(respuesta => respuesta.data?.pistas ?? []),
      catchError(() => of([]))
    );
  }

  completarCuestionario(idLeccion: number): Observable<{
    completada: boolean;
    siguiente_nivel: number | null;
    xp_mision: number;
    xp_obtenida: number;
    porcentaje: number;
  }> {
    return this.http.post<{ status: string; data: {
      completada: boolean;
      siguiente_nivel: number | null;
      xp_mision: number;
      xp_obtenida: number;
      porcentaje: number;
    } }>(`${this.apiUrl}/css/lecciones/${idLeccion}/completar-cuestionario`, {}).pipe(
      map(respuesta => respuesta.data)
    );
  }

  registrarIntentoCss(idReto: number, codigo: string): Observable<ResultadoIntentoCss> {
    return this.http.post<RespuestaIntentoCss>(
      `${this.apiUrl}/css/retos/${idReto}/intentos`,
      { codigo }
    ).pipe(
      map(respuesta => respuesta.data)
    );
  }

}
