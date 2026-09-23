import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { IProgreso } from '../interfaces/progreso.interface';

@Injectable({ providedIn: 'root' })
export class ProgresoService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/progresos`;

  obtenerPorUsuarioYLenguaje(idUsuario: number, idLenguaje: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/usuario/${idUsuario}/lenguaje/${idLenguaje}`
    );
  }

  crear(progreso: IProgreso): Observable<any> {
    return this.http.post<any>(this.apiUrl, progreso);
  }

  actualizar(idProgreso: number, progreso: Partial<IProgreso>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idProgreso}`, progreso);
  }
}