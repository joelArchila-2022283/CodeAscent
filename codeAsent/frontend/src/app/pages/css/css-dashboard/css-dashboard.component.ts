import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CssDashboardSectionComponent } from './css-dashboard-section.component';
import { CssDataComponent } from '../css-data/css-data.component';
import { CssProcessesComponent } from '../css-processes/css-processes.component';
import { CssTerminalComponent } from '../css-terminal/css-terminal.component';
import { CssTestComponent } from '../css-test/css-test.component';

import { DashboardService } from '../../../services/dashboard.service';
import { CssDataService, CssMision } from '../../../services/css-data.service';
import { obtenerUrlAvatar } from '../../../utils/avatar.util';

export type CSSSection =
  | 'dashboard'
  | 'data'
  | 'lesson'
  | 'processes'
  | 'terminal'
  | 'test';

@Component({
  selector: 'app-css-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CssDashboardSectionComponent,
    CssDataComponent,
    CssProcessesComponent,
    CssTerminalComponent,
    CssTestComponent
  ],
  templateUrl: './css-dashboard.component.html',
  styleUrl: './css-dashboard.component.scss'
})
export class CssDashboardComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly cssDataService = inject(CssDataService);

  activeSection = signal<CSSSection>('dashboard');
  selectedMission = signal<CssMision | null>(null);
  cuestionarioAprobado = signal(false);
  misiones = signal<CssMision[]>([]);

  player = {
    name: '',
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    progress: 0
  };

  jugadorCargando = signal(true);

  ngOnInit(): void {
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: data => {
        if (data?.usuario?.nombre) {
          this.player.name = data.usuario.nombre;
        }

        this.jugadorCargando.set(false);
      },
      error: err => {
        console.error('Error al cargar usuario CSS:', err);
        this.jugadorCargando.set(false);
      }
    });

    this.recargarProgreso();
    this.recargarMisiones();
  }

  recargarProgreso(): void {
    this.cssDataService.obtenerContexto().subscribe({
      next: contexto => {
        this.player.level =
          contexto.nivelActual?.numero_nivel ?? 1;

        this.player.currentXp =
          contexto.progreso?.xp_actual ?? 0;

        this.player.nextLevelXp =
          contexto.nivelActual?.xp_requerida ?? 100;

        this.player.progress =
          contexto.progreso?.porcentaje ?? 0;
      },
      error: err => {
        console.error('Error al cargar progreso CSS:', err);
      }
    });
  }

  navigateTo(section: CSSSection): void {
    if (["lesson", "terminal", "test"].includes(section) && !this.misionDisponible()) {
      this.activeSection.set("processes");
      return;
    }
    this.activeSection.set(section);
  }

  recargarMisiones(): void {
    this.cssDataService.obtenerMisionesCss().subscribe({
      next: misiones => {
        this.misiones.set(misiones);

        // No reemplazar el @Input mientras el cuestionario muestra el resultado.
        // Cambiar la referencia aquí dispararía ngOnChanges y reiniciaría el test.
        if (this.activeSection() !== 'test') {
          const selectedId = this.selectedMission()?.nivel.id_nivel;
          const actualizada = misiones.find(
            mision => mision.nivel.id_nivel === selectedId
          );
          if (actualizada) this.selectedMission.set(actualizada);
        }
      },
      error: err => console.error("Error cargando misiones CSS:", err)
    });
  }

  private misionDisponible(): boolean {
    const id = this.selectedMission()?.nivel.id_nivel;
    return !!id && this.misiones().some(m => m.nivel.id_nivel === id && m.desbloqueada);
  }

  abrirSiguienteNivel(): void {
    const numero = this.selectedMission()?.nivel.numero_nivel;
    this.cssDataService.obtenerMisionesCss().subscribe({
      next: misiones => {
        this.misiones.set(misiones);
        this.cuestionarioAprobado.set(false);

        const siguiente = misiones.find(
          mision => mision.nivel.numero_nivel === (numero ?? 0) + 1
            && mision.desbloqueada
        );

        if (siguiente) this.seleccionarMision(siguiente);
        else this.navigateTo('processes');
      },
      error: () => this.navigateTo('processes')
    });
  }

  terminalCompletado(): void {
    this.navigateTo('test');
  }

  cuestionarioCompletado(): void {
    this.cuestionarioAprobado.set(true);
    this.recargarProgreso();
    this.recargarMisiones();
  }

  seleccionarMision(mision: CssMision): void {
    if (!mision.desbloqueada) return;
    this.cuestionarioAprobado.set(false);
    this.selectedMission.set(mision);
    this.navigateTo('data');
  }

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }
}
