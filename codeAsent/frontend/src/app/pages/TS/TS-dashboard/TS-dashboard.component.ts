import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../../services/dashboard.service';
import { TsDataService } from '../../../services/ts-data.service';
import { obtenerUrlAvatar } from '../../../utils/avatar.util';

import { TSDataComponent } from '../TS-data/TS-data.component';
import { TSProcessesComponent } from '../TS-processes/TS-processes.component';
import { TsTerminalComponent } from '../TS-terminal/TS-terminal.component';
import { TSTestComponent } from '../TS-test/TS-test.component';
import { TSDashboardSectionComponent } from './TS-dashboard-section.component';

import { IMission } from '../../../core/models/language.model';
import { MissionProgressService } from '../../../core/services/mission-progress.service';

export type TSSection =
  | 'dashboard'
  | 'data'
  | 'lesson'
  | 'processes'
  | 'terminal'
  | 'test';

type MascotState = 'idle' | 'happy' | 'thinking' | 'shocked';

@Component({
  selector: 'app-ts-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TSDashboardSectionComponent,
    TSDataComponent,
    TSProcessesComponent,
    TsTerminalComponent,
    TSTestComponent
  ],
  templateUrl: './TS-dashboard.component.html',
  styleUrl: './TS-dashboard.component.scss'
})
export class TSDashboardComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly tsDataService = inject(TsDataService);
  private readonly missionProgressService = inject(MissionProgressService);

  activeSection = signal<TSSection>('dashboard');

  jugadorCargando = signal(true);

  retoSeleccionado = signal<IMission | null>(null);

  player = {
    name: '',
    level: 1,
    currentXp: 0,
    nextLevelXp: 500,
    energyWatts: 86
  };

  cartoonMascotState = signal<MascotState>('idle');

  mascotDialogue = signal(
    'El sector TypeScript está listo para trabajar.'
  );

  ngOnInit(): void {
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: data => {

        if (data?.usuario?.nombre) {
          this.player.name = data.usuario.nombre;
        }

        const progreso = data?.progreso;

        this.player.currentXp = Math.max(
          0,
          Number(progreso?.xp_actual ?? 0)
        );

        this.player.level = Math.max(
          1,
          Number(progreso?.id_nivel_actual ?? 1)
        );

        this.player.nextLevelXp = Math.max(
          1,
          Number(progreso?.id_nivel_actual ? 500 : 50)
        );

        this.jugadorCargando.set(false);
      },

      error: error => {
        console.error(
          'Error al cargar usuario TypeScript:',
          error
        );

        this.jugadorCargando.set(false);
      }
    });

    /*
     * Igual que el dashboard HTML:
     * el contexto solamente alimenta el HUD.
     * NO bloquea la navegación.
     */
    this.tsDataService.obtenerContexto().subscribe({
      next: contexto => {

        if (contexto?.nivelActual) {
          this.player.level =
            Number(contexto.nivelActual.numero_nivel ?? this.player.level);

          this.player.nextLevelXp =
            Math.max(
              1,
              Number(contexto.nivelActual.xp_requerida ?? this.player.nextLevelXp)
            );
        }

        if (contexto?.progreso) {
          this.player.currentXp =
            Math.max(
              0,
              Number(contexto.progreso.xp_actual ?? this.player.currentXp)
            );
        }
      },

      error: error => {
        console.error(
          'Error al cargar contexto TypeScript:',
          error
        );
      }
    });
  }

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }

  seleccionarReto(mission: IMission): void {
    if (!mission) {
      return;
    }

    this.retoSeleccionado.set(mission);

    /*
     * Igual que HTML:
     * seleccionar misión -> abrir manual inmediatamente.
     */
    this.navigateTo('data');
  }

  avanzarALeccion(): void {
    this.avanzarPaso('lesson', 'lesson');
  }

  avanzarATerminal(): void {
    /*
     * Igual que HTML:
     * la navegación NO depende de una llamada de progreso.
     */
    this.avanzarPaso('terminal', 'terminal');
  }

  private avanzarPaso(step: 'lesson' | 'terminal', section: TSSection): void {
    const missionId = this.retoSeleccionado()?.id_leccion;
    if (!missionId) return;
    this.missionProgressService.updateProgress(missionId, step).subscribe({
      next: () => this.navigateTo(section),
      error: error => console.error(`No se pudo abrir el paso ${step}:`, error)
    });
  }

  terminalCompletado(): void {
    this.navigateTo('test');
  }

  volverDeTerminal(): void {
    this.navigateTo('lesson');
  }

  volverAProcesos(): void {
    this.retoSeleccionado.set(null);
    this.navigateTo('processes');
  }

  navigateTo(section: TSSection): void {

    /*
     * Igual que HTML:
     * cambiar de pantalla no depende de BD.
     */
    this.activeSection.set(section);

    const dialogos: Record<TSSection, string> = {
      dashboard:
        'Panel TypeScript principal listo.',

      data:
        'Estudia el Manual Técnico antes de operar.',

      lesson:
        'Lee la lección y relaciona el concepto con la misión.',

      processes:
        'Selecciona una misión para comenzar.',

      terminal:
        'El laboratorio TypeScript está listo para recibir tu código.',

      test:
        'Demuestra lo aprendido en el cuestionario.'
    };

    this.mascotDialogue.set(dialogos[section]);

    this.cartoonMascotState.set(
      section === 'test'
        ? 'thinking'
        : 'happy'
    );
  }

  sumarExperiencia(xp: number): void {
    this.player.currentXp = Math.max(
      0,
      this.player.currentXp + Math.max(0, Number(xp) || 0)
    );
  }

  obtenerPorcentajeXp(): number {
    if (
      !Number.isFinite(this.player.currentXp) ||
      !Number.isFinite(this.player.nextLevelXp) ||
      this.player.nextLevelXp <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (this.player.currentXp / this.player.nextLevelXp) * 100
      )
    );
  }
}