import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { DashboardData } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  obtenerDatosDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(
      `${this.apiUrl}/resumen`
    );
  }

  actualizarNombreUsuario(idUsuario: number, nombre: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/usuarios/${idUsuario}`, { nombre });
  }
}