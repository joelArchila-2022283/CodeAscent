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

const NOMBRE_LENGUAJE_TS = 'typescript';

interface RespuestaLenguajes {
    exito: boolean;
    datos: ILenguaje[];
}

interface RespuestaNiveles {
    status: string;
    data: INivel[];
}

interface RespuestaProgreso {
    status: string;
    data: IProgreso;
}

interface RespuestaLecciones {
    status: string;
    data: ILeccion[];
}

/**
 * Contexto base del sector TypeScript: lenguaje, niveles, progreso
 * del usuario autenticado (si existe) y el nivel que le corresponde.
 * Es el punto de entrada común que reutilizan el resto de métodos
 * y componentes, para no repetir esta cadena de llamadas en cada pantalla.
 */
export interface ContextoTS {
    idLenguaje: number;
    niveles: INivel[];
    nivelActual: INivel | null;
    progreso: IProgreso | null;
}

export interface ResumenTSData {
    conceptosRegistrados: number;
    nivel: INivel | null;
    progreso: IProgreso | null;
    tieneProgreso: boolean;
    consejo: string | null;
}

export interface LeccionesNivelActual {
    nivel: INivel | null;
    lecciones: ILeccion[];
}

@Injectable({
    providedIn: 'root'
})
export class TsDataService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = environment.apiUrl;

    obtenerContexto(): Observable<ContextoTS> {
        return this.http.get<RespuestaLenguajes>(`${this.apiUrl}/lenguajes`).pipe(
            switchMap(respuestaLenguajes => {
                const lenguajeTS = (respuestaLenguajes.datos || []).find(
                    l => l.nombre?.toLowerCase() === NOMBRE_LENGUAJE_TS
                );

                if (!lenguajeTS || !lenguajeTS.id_lenguaje) {
                    throw new Error(
                        'El lenguaje TypeScript no está configurado en la base de datos.'
                    );
                }

                const idLenguaje = lenguajeTS.id_lenguaje;
                const idUsuario = this.authService.obtenerIdUsuario();

                const niveles$ = this.http.get<RespuestaNiveles>(
                    `${this.apiUrl}/niveles/lenguaje/${idLenguaje}`
                );

                const progreso$: Observable<IProgreso | null> = idUsuario
                    ? this.http
                        .get<RespuestaProgreso>(
                            `${this.apiUrl}/progresos/usuario/${idUsuario}/lenguaje/${idLenguaje}`
                        )
                        .pipe(
                            map(respuesta => respuesta.data),
                            // 404 (sin progreso todavía) o 401 -> se trata como "sin progreso".
                            catchError(() => of(null))
                        )
                    : of(null);

                return forkJoin({ niveles: niveles$, progreso: progreso$ }).pipe(
                    map(({ niveles, progreso }) => {
                        const listaNiveles = niveles.data || [];

                        const nivelActual =
                            (progreso?.id_nivel_actual
                                ? listaNiveles.find(n => n.id_nivel === progreso.id_nivel_actual)
                                : null) ?? listaNiveles[0] ?? null;

                        return {
                            idLenguaje,
                            niveles: listaNiveles,
                            nivelActual,
                            progreso
                        } as ContextoTS;
                    })
                );
            })
        );
    }

    /** Vista compuesta que necesita TSDataComponent (panel ARCHIVOS). */
    obtenerResumen(): Observable<ResumenTSData> {
        return this.obtenerContexto().pipe(
            switchMap(contexto => {
                if (!contexto.nivelActual?.id_nivel) {
                    return of<ResumenTSData>({
                        conceptosRegistrados: 0,
                        nivel: null,
                        progreso: contexto.progreso,
                        tieneProgreso: !!contexto.progreso,
                        consejo: null
                    });
                }

                return this.http
                    .get<RespuestaLecciones>(
                        `${this.apiUrl}/lecciones/nivel/${contexto.nivelActual.id_nivel}`
                    )
                    .pipe(
                        map(respuestaLecciones => {
                            const lecciones = respuestaLecciones.data || [];
                            return {
                                conceptosRegistrados: lecciones.length,
                                nivel: contexto.nivelActual,
                                progreso: contexto.progreso,
                                tieneProgreso: !!contexto.progreso,
                                consejo: lecciones[0]?.contenido ?? null
                            } as ResumenTSData;
                        }),
                        catchError(() =>
                            of<ResumenTSData>({
                                conceptosRegistrados: 0,
                                nivel: contexto.nivelActual,
                                progreso: contexto.progreso,
                                tieneProgreso: !!contexto.progreso,
                                consejo: null
                            })
                        )
                    );
            })
        );
    }

    /**
     * Nivel actual de TypeScript y sus lecciones.
     * Usado por TS-processes (retos por lección), TS-test (preguntas)
     * y TS-terminal (código de ejemplo).
     */
    obtenerLeccionesNivelActual(): Observable<LeccionesNivelActual> {
        return this.obtenerContexto().pipe(
            switchMap(contexto => {
                if (!contexto.nivelActual?.id_nivel) {
                    return of<LeccionesNivelActual>({ nivel: null, lecciones: [] });
                }

                return this.http
                    .get<RespuestaLecciones>(
                        `${this.apiUrl}/lecciones/nivel/${contexto.nivelActual.id_nivel}`
                    )
                    .pipe(
                        map(respuesta => ({
                            nivel: contexto.nivelActual,
                            lecciones: respuesta.data || []
                        })),
                        catchError(() =>
                            of<LeccionesNivelActual>({ nivel: contexto.nivelActual, lecciones: [] })
                        )
                    );
            })
        );
    }
}