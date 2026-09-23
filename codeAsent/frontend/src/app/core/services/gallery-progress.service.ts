import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DashboardData, PerfilLenguaje } from '../../interfaces/usuario.interface';
import { DashboardService } from '../../services/dashboard.service';

export type GalleryModule = 'html' | 'css' | 'sql' | 'typescript';

@Injectable({ providedIn: 'root' })
export class GalleryProgressService {
  private readonly dashboard = inject(DashboardService);
  private readonly groups: Record<GalleryModule, { from: number; to: number }> = {
    html: { from: 1, to: 4 },
    css: { from: 5, to: 6 },
    sql: { from: 7, to: 7 },
    typescript: { from: 8, to: 10 },
  };

  obtenerDesbloqueados(): Observable<number[]> {
    return this.dashboard.obtenerDatosDashboard().pipe(
      map(datos => this.calcularDesbloqueados(datos))
    );
  }

  private calcularDesbloqueados(datos: DashboardData): number[] {
    const desbloqueados: number[] = [];
    const lenguajes = datos.perfil?.lenguajes ?? [];

    for (const modulo of Object.keys(this.groups) as GalleryModule[]) {
      const lenguaje = this.buscarLenguaje(lenguajes, modulo);
      if (Number(lenguaje?.xp_actual ?? 0) > 0) {
        const grupo = this.groups[modulo];
        for (let comic = grupo.from; comic <= grupo.to; comic++) {
          desbloqueados.push(comic);
        }
      }
    }

    return desbloqueados;
  }

  private buscarLenguaje(lenguajes: PerfilLenguaje[], modulo: GalleryModule): PerfilLenguaje | undefined {
    return lenguajes.find(lenguaje => lenguaje.nombre?.toLowerCase() === modulo);
  }
}
