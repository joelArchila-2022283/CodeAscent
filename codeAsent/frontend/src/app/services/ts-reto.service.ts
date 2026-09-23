import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {
    Observable,
    forkJoin,
    of
} from 'rxjs';

import {
    catchError,
    map
} from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { AuthService } from './auth.service';

import { IReto } from '../interfaces/reto.interface';

import { IRespuesta } from '../interfaces/respuesta.interface';

import { IIntento } from '../interfaces/intento.interface';

interface RespuestaRetos {

    status: string;

    data: IReto[];

}

interface RespuestaIntentos {

    mensaje: string;

    datos: IIntento[];

}

@Injectable({
    providedIn: 'root'
})
export class RetoService {

    private http =
        inject(HttpClient);

    private authService =
        inject(AuthService);

    private apiUrl =
        environment.apiUrl;


    /**
     * Todos los retos de un conjunto de lecciones.
     */
    obtenerRetosDeLecciones(
        idsLeccion: number[]
    ): Observable<IReto[]> {

        if (
            idsLeccion.length === 0
        ) {

            return of([]);

        }

        const peticiones =
            idsLeccion.map(
                id =>

                    this.http
                        .get<RespuestaRetos>(
                            `${this.apiUrl}/retos/leccion/${id}`
                        )

                        .pipe(

                            map(
                                respuesta =>
                                    respuesta.data || []
                            ),

                            catchError(
                                () =>
                                    of<IReto[]>([])
                            )

                        )
            );

        return forkJoin(
            peticiones
        ).pipe(

            map(
                listas =>
                    listas.flat()
            )

        );
    }


    /**
     * Opciones de respuesta de un reto
     * de tipo opción múltiple.
     */
    obtenerRespuestasDeReto(
        idReto: number
    ): Observable<IRespuesta[]> {

        return this.http

            .get<IRespuesta[]>(
                `${this.apiUrl}/respuestas/reto/${idReto}`
            )

            .pipe(

                catchError(
                    () =>
                        of<IRespuesta[]>([])
                )

            );
    }


    /**
     * Obtiene los retos que el usuario
     * autenticado ya completó correctamente.
     */
    obtenerRetosCompletados():
        Observable<Set<number>> {

        const idUsuario =
            this.authService
                .obtenerIdUsuario();

        if (!idUsuario) {

            return of(
                new Set<number>()
            );

        }

        return this.http

            .get<RespuestaIntentos>(
                `${this.apiUrl}/intentos/usuario/${idUsuario}`
            )

            .pipe(

                map(
                    respuesta =>

                        new Set(

                            (respuesta.datos || [])

                                .filter(
                                    intento =>
                                        intento.correcto
                                )

                                .map(
                                    intento =>
                                        intento.id_reto
                                )

                        )
                ),

                catchError(
                    () =>
                        of(
                            new Set<number>()
                        )
                )

            );
    }


    /**
     * Registra un intento de un reto.
     *
     * La XP enviada desde Angular es 0.
     * El backend/base de datos debe calcular
     * la recompensa real usando reto.xp_recompensa.
     */
    registrarIntento(
        datos: {
            id_reto: number;
            respuesta_usuario?: string | null;
            correcto: boolean;
            xp_obtenida?: number;
        }
    ): Observable<boolean> {

        const idUsuario =
            this.authService
                .obtenerIdUsuario();

        if (!idUsuario) {

            return of(false);

        }

        return this.http

            .post(
                `${this.apiUrl}/intentos`,
                {
                    id_usuario:
                        idUsuario,

                    ...datos
                }
            )

            .pipe(

                map(
                    () => true
                ),

                catchError(
                    () => of(false)
                )

            );
    }

    registrarIntentoConXp(
        datos: {
            id_reto: number;
            respuesta_usuario?: string | null;
            correcto: boolean;
        }
    ): Observable<number> {
        const idUsuario = this.authService.obtenerIdUsuario();
        if (!idUsuario) return of(0);

        return this.http.post<{ datos?: IIntento }>(
            `${this.apiUrl}/intentos`,
            { id_usuario: idUsuario, ...datos }
        ).pipe(
            map(respuesta => Number(respuesta.datos?.xp_obtenida ?? 0)),
            catchError(() => of(0))
        );
    }
}
