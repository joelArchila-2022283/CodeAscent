import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { obtenerUrlAvatar } from '../../../utils/avatar.util';
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
export class HtmlDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  activeSection = signal<HTMLSection>('dashboard');
  player = {
    name: '',
    level: 1,
    currentXp: 320,
    nextLevelXp: 500,
    energyWatts: 86
  };

  cartoonMascotState = signal<'idle' | 'happy' | 'thinking' | 'shocked'>('idle');
  mascotDialogue = signal<string>('El sector HTML está listo para trabajar.');
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
        console.error('Error al cargar usuario HTML:', err);
        this.jugadorCargando.set(false);
      }
    });
  }

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }

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
