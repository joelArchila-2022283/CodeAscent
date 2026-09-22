import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IGamificationData } from '../models/gamification.model';

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly data = signal<IGamificationData | null>(null);

  load(langSlug = 'html'): void {
    this.http.get<{ data: IGamificationData }>(`${this.apiUrl}/me/gamification?lang=${langSlug}`).subscribe({
      next: (res) => this.data.set(res.data),
      error: () => this.data.set(null)
    });
  }

  xpPercent(): number {
    const d = this.data();
    if (d?.porcentaje !== undefined) return d.porcentaje;
    if (!d || !d.nivelActual) return 0;
    const req = d.nivelActual.xp_requerida || 100;
    return Math.min(100, Math.round((d.xpTotal / req) * 100));
  }

  unlockedCount(): number {
    const d = this.data();
    if (!d || !d.logros) return 0;
    return d.logros.filter(l => l.obtenido).length;
  }
}
