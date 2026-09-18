import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { NivelSql } from '../interfaces/sql.interface';

interface RespuestaNivelesSql {
  status: string;
  data: NivelSql[];
}

@Injectable({ providedIn: 'root' })
export class SqlService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/sql';

  obtenerNiveles(): Observable<NivelSql[]> {
    return this.http.get<RespuestaNivelesSql>(`${this.apiUrl}/niveles`).pipe(
      map(respuesta => respuesta.data)
    );
  }
}