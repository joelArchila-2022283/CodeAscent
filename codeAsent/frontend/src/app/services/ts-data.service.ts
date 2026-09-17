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
 * Vista compuesta que necesita TSDataComponent.
 * Se arma a partir de datos reales existentes en:
 * lenguaje, nivel, progreso y leccion. No inventa columnas.
 */
export interface ResumenTSData {
    conceptosRegistrados: number;
    nivel: INivel | null;
    progreso: IProgreso | null;
    tieneProgreso: boolean;
    consejo: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class TsDataService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = environment.apiUrl;

    obtenerResumen(): Observable<ResumenTSData> {
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
                            // 404 (usuario sin progreso todavía) o 401 -> se trata
                            // como "sin progreso registrado", no como error fatal.
                            catchError(() => of(null))
                        )
                    : of(null);

                return forkJoin({ niveles: niveles$, progreso: progreso$ }).pipe(
                    switchMap(({ niveles, progreso }) => {
                        const listaNiveles = niveles.data || [];

                        const nivelActual =
                            (progreso?.id_nivel_actual
                                ? listaNiveles.find(n => n.id_nivel === progreso.id_nivel_actual)
                                : null) ?? listaNiveles[0] ?? null;

                        if (!nivelActual?.id_nivel) {
                            return of<ResumenTSData>({
                                conceptosRegistrados: 0,
                                nivel: null,
                                progreso,
                                tieneProgreso: !!progreso,
                                consejo: null
                            });
                        }

                        return this.http
                            .get<RespuestaLecciones>(
                                `${this.apiUrl}/lecciones/nivel/${nivelActual.id_nivel}`
                            )
                            .pipe(
                                map(respuestaLecciones => {
                                    const lecciones = respuestaLecciones.data || [];
                                    return {
                                        conceptosRegistrados: lecciones.length,
                                        nivel: nivelActual,
                                        progreso,
                                        tieneProgreso: !!progreso,
                                        consejo: lecciones[0]?.contenido ?? null
                                    } as ResumenTSData;
                                }),
                                catchError(() =>
                                    of<ResumenTSData>({
                                        conceptosRegistrados: 0,
                                        nivel: nivelActual,
                                        progreso,
                                        tieneProgreso: !!progreso,
                                        consejo: null
                                    })
                                )
                            );
                    })
                );
            })
        );
    }
}