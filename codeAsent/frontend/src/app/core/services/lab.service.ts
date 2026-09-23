import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILabContext } from '../models/lab.model';

@Injectable({ providedIn: 'root' })
export class LabService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getLabData(missionId: number): Observable<{ data: ILabContext }> {
    return this.http.get<{ data: ILabContext }>(`${this.apiUrl}/missions/${missionId}/lab`);
  }
}
