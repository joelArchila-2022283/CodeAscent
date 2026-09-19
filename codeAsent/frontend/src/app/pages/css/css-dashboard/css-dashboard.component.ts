import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CssDashboardSectionComponent } from './css-dashboard-section.component';
import { CssDataComponent } from '../css-data/css-data.component';
import { CssProcessesComponent } from '../css-processes/css-processes.component';
import { CssTerminalComponent } from '../css-terminal/css-terminal.component';
import { CssTestComponent } from '../css-test/css-test.component';

import { DashboardService } from '../../../services/dashboard.service';
import { CssDataService } from '../../../services/css-data.service';
import { obtenerUrlAvatar } from '../../../utils/avatar.util';

export type CSSSection =
  | 'dashboard'
  | 'data'
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
  selectedPedagogyLevel = signal(1);

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
    this.activeSection.set(section);
  }

  openPractice(level: number): void {
    this.selectedPedagogyLevel.set(level);
    this.activeSection.set('terminal');
  }

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }
}