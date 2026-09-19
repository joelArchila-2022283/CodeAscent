import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardData } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/dashboard';

  obtenerDatosDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(
      `${this.apiUrl}/resumen`
    );
  }

  actualizarNombreUsuario(idUsuario: number, nombre: string): Observable<void> {
    return this.http.put<void>(`http://localhost:3000/api/usuarios/${idUsuario}`, { nombre });
  }
}