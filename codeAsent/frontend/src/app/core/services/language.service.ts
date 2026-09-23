import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILanguage, IMission } from '../models/language.model';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obtenerLenguajes(): Observable<{ data: ILanguage[] }> {
    return this.http.get<{ data: ILanguage[] }>(`${this.apiUrl}/lenguajes`);
  }

  obtenerMisionesPorSlug(slug: string): Observable<{ data: IMission[] }> {
    return this.http.get<{ data: IMission[] }>(`${this.apiUrl}/lenguajes/${slug}/missions`);
  }
}
