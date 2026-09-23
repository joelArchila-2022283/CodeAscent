import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { IEjemplo } from '../interfaces/ejemplo.interface';

interface RespuestaEjemplos {
    mensaje: string;
    datos: IEjemplo[];
}

@Injectable({
    providedIn: 'root'
})
export class EjemploService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    obtenerPorLeccion(idLeccion: number): Observable<IEjemplo[]> {
        return this.http
            .get<RespuestaEjemplos>(`${this.apiUrl}/ejemplos/leccion/${idLeccion}`)
            .pipe(
                map(respuesta => respuesta.datos || []),
                catchError(() => of<IEjemplo[]>([]))
            );
    }
}