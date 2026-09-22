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
import { IReto } from '../../../interfaces/reto.interface';
import { MissionProgressService } from '../../../core/services/mission-progress.service';

export type HTMLSection = 'dashboard' | 'data' | 'lesson' | 'processes' | 'terminal' | 'test';

@Component({
  selector: 'app-html-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HtmlDashboardSectionComponent, HtmlDataComponent, HtmlProcessesComponent, HtmlTerminalComponent, HtmlTestComponent],
  templateUrl: './html-dashboard.component.html',
  styleUrl: './html-dashboard.component.scss'
})
export class HtmlDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly missionProgressService = inject(MissionProgressService);

  activeSection = signal<HTMLSection>('dashboard');
  player = {
    name: '',
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    energyWatts: 86
  };

  cartoonMascotState = signal<'idle' | 'happy' | 'thinking' | 'shocked'>('idle');
  mascotDialogue = signal<string>('El sector HTML está listo para trabajar.');
  jugadorCargando = signal(true);
  
  retoSeleccionado = signal<IReto | null>(null);
  leccionActual = signal<string>('');
  terminalLista = signal(false);

  ngOnInit(): void {
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: data => {
        if (data?.usuario?.nombre) {
          this.player.name = data.usuario.nombre;
        }
        const perfilHtml = data?.perfil?.lenguajes?.find(lenguaje => lenguaje.nombre?.toLowerCase() === 'html');
        this.player.currentXp = Math.max(0, Number(perfilHtml?.xp_actual ?? data?.progreso?.xp_actual ?? 0));
        this.player.level = Math.max(1, Number(perfilHtml?.nivel_actual ?? 1));
        this.player.nextLevelXp = Math.max(1, Number(perfilHtml?.xp_siguiente_nivel ?? this.player.currentXp + 100));
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
      data: 'Estudia el Manual Técnico antes de operar.',
      lesson: 'Lee la lección y relaciona el concepto con la misión.',
      processes: 'Selecciona una misión para comenzar.',
      terminal: 'El laboratorio CRT está listo para recibir tus etiquetas.',
      test: 'Demuestra lo aprendido en el cuestionario.'
    };

    this.mascotDialogue.set(dialogos[section]);
    this.cartoonMascotState.set(section === 'test' ? 'thinking' : 'happy');
  }

  seleccionarReto(reto: any): void {
    this.retoSeleccionado.set(reto);
    this.leccionActual.set(reto.leccionContenido || ''); 
    this.terminalLista.set(false);
    this.navigateTo('data');
  }

  terminalCompletado(xp: number): void {
    this.terminalLista.set(true);
    this.sumarExperiencia(xp);
  }

  irAlCuestionario(): void {
    const idLeccion = this.retoSeleccionado()?.id_leccion;
    if (!idLeccion || !this.terminalLista()) return;
    this.missionProgressService.updateProgress(idLeccion, 'quiz').subscribe({
      next: () => this.navigateTo('test'),
      error: error => console.error('No se pudo desbloquear el cuestionario:', error)
    });
  }

  sumarExperiencia(xp: number): void {
    this.player.currentXp = Math.max(0, this.player.currentXp + Math.max(0, Number(xp) || 0));
    while (this.player.currentXp >= this.player.nextLevelXp) {
      this.player.level += 1;
      this.player.nextLevelXp += this.player.level * 100;
    }
  }

  obtenerPorcentajeXp(): number {
    if (!Number.isFinite(this.player.currentXp) || !Number.isFinite(this.player.nextLevelXp) || this.player.nextLevelXp <= 0) return 0;
    return Math.min(100, Math.max(0, (this.player.currentXp / this.player.nextLevelXp) * 100));
  }
}
