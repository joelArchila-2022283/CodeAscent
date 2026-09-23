import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IMissionProgress {
  user_id: number;
  mission_id: number;
  reached_step: 'manual' | 'lesson' | 'terminal' | 'quiz';
  completed: boolean;
  prediccion_correcta: boolean;
  pistas_usadas: number;
  first_try_perfect: boolean;
  terminal_code?: string | null;
}

@Injectable({ providedIn: 'root' })
export class MissionProgressService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProgress(missionId: number): Observable<{ data: IMissionProgress }> {
    return this.http.get<{ data: IMissionProgress }>(`${this.apiUrl}/missions/${missionId}/progress`);
  }

  updateProgress(missionId: number, step: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/missions/${missionId}/progress`, { reached_step: step });
  }

  updateTerminalStats(missionId: number, stats: { prediccion_correcta: boolean; pistas_usadas: number; codigo?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/missions/${missionId}/terminal-stats`, stats);
  }

  saveTerminalDraft(missionId: number, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/missions/${missionId}/terminal-draft`, { codigo });
  }

  completeMission(missionId: number, correct: number, total: number, source: 'terminal' | 'quiz'): Observable<any> {
    return this.http.post(`${this.apiUrl}/missions/${missionId}/complete`, { correct, total, source });
  }
}
