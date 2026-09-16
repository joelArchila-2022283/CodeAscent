import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TSDataComponent } from '../TS-data/TS-data.component';
import { TSProcessesComponent } from '../TS-processes/TS-processes.component';
import { TsTerminalComponent } from '../TS-terminal/TS-terminal.component';
import { TSTestComponent } from '../TS-test/TS-test.component';
import { TSDashboardSectionComponent } from './TS-dashboard-section.component';

export type TSSection =
  | 'dashboard'
  | 'data'
  | 'processes'
  | 'terminal'
  | 'test';

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
export class TSDashboardComponent {

  activeSection = signal<TSSection>('dashboard');

  player = {
    name: 'Cadete Bit',
    level: 1,
    currentXp: 320,
    nextLevelXp: 500,
    energyWatts: 86
  };

  cartoonMascotState = signal<
    'idle' | 'happy' | 'thinking' | 'shocked'
  >('idle');

  mascotDialogue = signal<string>(
    'El sector TS está listo para trabajar.'
  );

  navigateTo(section: TSSection): void {

    this.activeSection.set(section);

    const dialogos: Record<TSSection, string> = {
      dashboard: 'Panel TS principal listo.',
      data: 'Los registros TypeScript están listos.',
      processes: 'Procesos TypeScript listos para ejecutar.',
      terminal: 'La consola CRT está lista para ejecutar TypeScript.',
      test: 'La prueba de TypeScript está lista.'
    };

    this.mascotDialogue.set(dialogos[section]);

    this.cartoonMascotState.set(
      section === 'test' ? 'thinking' : 'happy'
    );
  }
}