import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HtmlDataComponent } from '../html-data/html-data.component';
import { HtmlProcessesComponent } from '../html-processes/html-processes.component';
import { HtmlTerminalComponent } from '../html-terminal/html-terminal.component';
import { HtmlTestComponent } from '../html-test/html-test.component';
import { HtmlDashboardSectionComponent } from './html-dashboard-section.component';

export type HTMLSection = 'dashboard' | 'data' | 'processes' | 'terminal' | 'test';

@Component({
  selector: 'app-html-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HtmlDashboardSectionComponent, HtmlDataComponent, HtmlProcessesComponent, HtmlTerminalComponent, HtmlTestComponent],
  templateUrl: './html-dashboard.component.html',
  styleUrl: './html-dashboard.component.scss'
})
export class HtmlDashboardComponent {
  activeSection = signal<HTMLSection>('dashboard');
  player = {
    name: 'Cadete Bit',
    level: 1,
    currentXp: 320,
    nextLevelXp: 500,
    energyWatts: 86
  };

  cartoonMascotState = signal<'idle' | 'happy' | 'thinking' | 'shocked'>('idle');
  mascotDialogue = signal<string>('El sector HTML está listo para trabajar.');

  navigateTo(section: HTMLSection) {
    this.activeSection.set(section);
    const dialogos = {
      dashboard: 'Panel HTML principal listo.',
      data: 'Los registros antiguos guardan la estructura de la web.',
      processes: 'Procesos HTML listos para ejecutar.',
      terminal: 'La consola CRT está lista para renderizar tus etiquetas.',
      test: 'La prueba de compatibilidad está lista.'
    };

    this.mascotDialogue.set(dialogos[section]);
    this.cartoonMascotState.set(section === 'test' ? 'thinking' : 'happy');
  }
}
