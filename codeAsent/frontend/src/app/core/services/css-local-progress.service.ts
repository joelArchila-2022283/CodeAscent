import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export interface CssLocalProgress {
  completedMissionIds: number[];
  xp: number;
  level: number;
}

@Injectable({ providedIn: 'root' })
export class CssLocalProgressService {
  private readonly auth = inject(AuthService);
  private readonly defaultProgress: CssLocalProgress = {
    completedMissionIds: [],
    xp: 0,
    level: 1
  };

  read(): CssLocalProgress {
    if (typeof localStorage === 'undefined') return this.emptyProgress();

    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      if (!saved || !Array.isArray(saved.completedMissionIds)) {
        return this.emptyProgress();
      }

      return {
        completedMissionIds: saved.completedMissionIds.filter(
          (id: unknown): id is number => Number.isInteger(id)
        ),
        xp: Math.max(0, Number(saved.xp) || 0),
        level: Math.max(1, Number(saved.level) || 1)
      };
    } catch {
      return this.emptyProgress();
    }
  }

  completeMission(missionId: number, xpAwarded: number, level?: number): CssLocalProgress {
    const progress = this.read();
    if (!progress.completedMissionIds.includes(missionId)) {
      progress.completedMissionIds.push(missionId);
      progress.xp += Math.max(0, xpAwarded || 50);
    }

    progress.level = level ?? progress.completedMissionIds.length + 1;
    this.write(progress);
    return progress;
  }

  private write(progress: CssLocalProgress): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    }
  }

  private get storageKey(): string {
    return `codeascent.css.progress.v1.${this.auth.obtenerIdUsuario() ?? 'guest'}`;
  }

  private emptyProgress(): CssLocalProgress {
    return { ...this.defaultProgress, completedMissionIds: [] };
  }
}
