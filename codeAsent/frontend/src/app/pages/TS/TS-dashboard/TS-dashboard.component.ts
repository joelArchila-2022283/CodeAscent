import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TSDataComponent } from '../TS-data/TS-data.component';
import { TSProcessesComponent } from '../TS-processes/TS-processes.component';
import { TsTerminalComponent } from '../TS-terminal/TS-terminal.component';
import { TSTestComponent } from '../TS-test/TS-test.component';
import { TSDashboardSectionComponent } from './TS-dashboard-section.component';

import { DashboardService } from '../../../services/dashboard.service';
import { TsDataService } from '../../../services/ts-data.service';

import { IMisionTS } from '../../../interfaces/usuario.interface';
import { IReto } from '../../../interfaces/reto.interface';

export type TSSection =
  | 'dashboard'
  | 'data'
  | 'processes'
  | 'terminal'
  | 'test';

type MascotState =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'shocked';

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

  private readonly dashboardService =
    inject(DashboardService);

  private readonly tsDataService =
    inject(TsDataService);

  activeSection =
    signal<TSSection>('dashboard');

  misiones =
    signal<IMisionTS[]>([]);

  retoSeleccionado =
    signal<IReto | null>(null);

  player = {
    name: 'Cadete Bit',
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    energyWatts: 86
  };

  cartoonMascotState =
    signal<MascotState>('idle');

  mascotDialogue =
    signal<string>(
      'El sector TS está listo para trabajar.'
    );

  ngOnInit(): void {
    this.cargarJugador();
  }

  private cargarJugador(): void {

    this.dashboardService
      .obtenerDatosDashboard()
      .subscribe({

        next: data => {

          if (data?.usuario?.nombre) {
            this.player.name =
              data.usuario.nombre;
          }

          this.misiones.set(
            data?.misiones ?? []
          );
        },

        error: err => {

          console.error(
            'Error al cargar el dashboard:',
            err
          );

        }

      });

    this.tsDataService
      .obtenerContexto()
      .subscribe({

        next: contexto => {

          if (
            contexto?.nivelActual?.numero_nivel
          ) {
            this.player.level =
              contexto.nivelActual.numero_nivel;
          }

          this.player.currentXp =
            contexto?.progreso?.xp_actual ?? 0;

          if (
            contexto?.nivelActual?.xp_requerida
          ) {
            this.player.nextLevelXp =
              contexto.nivelActual.xp_requerida;
          }

        },

        error: err => {

          console.error(
            'Error al cargar el progreso del HUD:',
            err
          );

        }

      });
  }

  seleccionarReto(reto: IReto): void {

    this.retoSeleccionado.set(reto);

    this.activeSection.set('terminal');

    this.mascotDialogue.set(
      'Misión seleccionada. El terminal está esperando tu solución.'
    );

    this.cartoonMascotState.set('thinking');
  }

  navigateTo(section: TSSection): void {

    this.activeSection.set(section);

    if (section !== 'terminal') {
      this.retoSeleccionado.set(null);
    }

    const dialogos:
      Record<TSSection, string> = {

      dashboard:
        'Panel TS principal listo.',

      data:
        'Los registros TypeScript están listos.',

      processes:
        'Procesos TypeScript listos para ejecutar.',

      terminal:
        'La consola CRT está lista para ejecutar TypeScript.',

      test:
        'La prueba de TypeScript está lista.'
    };

    this.mascotDialogue.set(
      dialogos[section]
    );

    this.cartoonMascotState.set(
      section === 'test'
        ? 'thinking'
        : 'happy'
    );
  }

  volverDeTerminal(): void {

    this.retoSeleccionado.set(null);

    this.navigateTo('dashboard');
  }
}