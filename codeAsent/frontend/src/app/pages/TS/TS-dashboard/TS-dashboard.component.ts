import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { ProgresoService } from '../../../services/progreso.service';
import { AuthService } from '../../../services/auth.service';
import { MissionProgressService } from '../../../core/services/mission-progress.service';
import { obtenerUrlAvatar } from '../../../utils/avatar.util';
import { TSDataComponent } from '../TS-data/TS-data.component';
import { TSProcessesComponent } from '../TS-processes/TS-processes.component';
import { TsTerminalComponent } from '../TS-terminal/TS-terminal.component';
import { TSTestComponent } from '../TS-test/TS-test.component';
import { TSDashboardSectionComponent } from './TS-dashboard-section.component';

export type TSSection = 'dashboard' | 'data' | 'lesson' | 'processes' | 'terminal' | 'test';

@Component({
  selector: 'app-ts-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TSDashboardSectionComponent, TSDataComponent, TSProcessesComponent, TsTerminalComponent, TSTestComponent],
  templateUrl: './TS-dashboard.component.html',
  styleUrl: './TS-dashboard.component.scss'
})
export class TSDashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly progresoService = inject(ProgresoService);
  private readonly authService = inject(AuthService);
  private readonly missionProgressService = inject(MissionProgressService);

  activeSection = signal<TSSection>('dashboard');
  player = {
    name: '',
    level: 1,
    currentXp: 0,
    nextLevelXp: 500,
    energyWatts: 86
  };

  cartoonMascotState = signal<'idle' | 'happy' | 'thinking' | 'shocked'>('idle');
  mascotDialogue = signal<string>('El sector TS está listo para trabajar.');
  jugadorCargando = signal(true);

  retoSeleccionado = signal<any | null>(null);
  leccionActual = signal<string>('');

  private xpTotal = 0;
  private idProgreso: number | null = null;
  private idLenguajeTypeScript = 0;
  private umbrales: number[] = [];
  private idNiveles: number[] = [];
  private progresoDirty = false;

  ngOnInit(): void {
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: data => {
        if (data?.usuario?.nombre) {
          this.player.name = data.usuario.nombre;
        }
        this.construirUmbrales(data?.misiones);
        const lenguajeTs = (data?.perfil?.lenguajes ?? [])
          .find(l => String(l.nombre).toLowerCase() === 'typescript');
        this.idLenguajeTypeScript = Number(lenguajeTs?.id_lenguaje ?? 4);

        const idUsuario = this.authService.obtenerIdUsuario();
        if (idUsuario && this.idLenguajeTypeScript) {
          this.progresoService.obtenerPorUsuarioYLenguaje(idUsuario, this.idLenguajeTypeScript).subscribe({
            next: r => {
              const progreso = r?.data;
              if (progreso) {
                this.idProgreso = Number(progreso.id_progreso) || null;
                this.xpTotal = Math.max(0, Number(progreso.xp_actual ?? 0));
              }
              this.calcularHud();
              this.persistirProgreso();
              this.jugadorCargando.set(false);
            },
            error: () => {
              this.calcularHud();
              this.jugadorCargando.set(false);
            }
          });
        } else {
          this.jugadorCargando.set(false);
        }
      },
      error: err => {
        console.error('Error al cargar usuario TS:', err);
        this.jugadorCargando.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.persistirProgreso(true);
  }

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }

  navigateTo(section: TSSection) {
    this.activeSection.set(section);
    const dialogos = {
      dashboard: 'Panel TS principal listo.',
      data: 'Estudia el Manual Técnico antes de operar.',
      lesson: 'Lee la lección y relaciona el concepto con la misión.',
      processes: 'Selecciona una misión para comenzar.',
      terminal: 'El laboratorio TS está listo para recibir tu código.',
      test: 'Demuestra lo aprendido en el cuestionario.'
    };

    this.mascotDialogue.set(dialogos[section]);
    this.cartoonMascotState.set(section === 'test' ? 'thinking' : 'happy');
  }

  seleccionarReto(reto: any): void {
    this.retoSeleccionado.set(reto);
    this.leccionActual.set(reto.leccionContenido || '');
    this.navigateTo('data');
  }

  avanzarALeccion(): void {
    const mission = this.retoSeleccionado();
    if (mission?.id_leccion) {
      this.missionProgressService.updateProgress(mission.id_leccion, 'lesson').subscribe({
        error: () => undefined
      });
    }
    this.navigateTo('lesson');
  }

  avanzarATerminal(): void {
    this.navigateTo('terminal');
  }

  terminalCompletado(): void {
    this.navigateTo('test');
  }

  volverAProcesos(): void {
    this.retoSeleccionado.set(null);
    this.navigateTo('processes');
  }

  sumarExperiencia(xp: number): void {
    const cantidad = Math.max(0, Number(xp) || 0);
    if (cantidad <= 0) return;

    const nivelAntes = this.player.level;
    this.xpTotal += cantidad;
    this.calcularHud();
    this.progresoDirty = true;

    if (this.player.level > nivelAntes) {
      this.mascotDialogue.set(
        `¡Excelente! Has ascendido al nivel ${this.player.level} del sector TypeScript.`
      );
      this.cartoonMascotState.set('happy');
    }

    this.persistirProgreso();
  }

  obtenerPorcentajeXp(): number {
    if (!Number.isFinite(this.player.currentXp) || !Number.isFinite(this.player.nextLevelXp) || this.player.nextLevelXp <= 0) return 0;
    return Math.min(100, Math.max(0, (this.player.currentXp / this.player.nextLevelXp) * 100));
  }

  private construirUmbrales(misiones: any[] | undefined): void {
    const ordenadas = [...(misiones ?? [])]
      .sort((a, b) => Number(a.numero_nivel) - Number(b.numero_nivel))
      .map(mision => ({
        umbral: Number(mision.xp_requerida) || 0,
        idNivel: Number(mision.id_nivel)
      }))
      .filter(par => par.umbral > 0);

    this.umbrales = ordenadas.map(par => par.umbral);
    this.idNiveles = ordenadas.map(par => par.idNivel);
  }

  private calcularHud(): void {
    const total = this.umbrales.length;
    if (total === 0) {
      this.player.level = 1;
      this.player.nextLevelXp = 100;
      this.player.currentXp = this.xpTotal;
      return;
    }

    const cums: number[] = [];
    let acumulado = 0;
    for (const umbral of this.umbrales) {
      acumulado += umbral;
      cums.push(acumulado);
    }

    let completados = -1;
    for (let i = 0; i < total; i++) {
      if (cums[i] <= this.xpTotal) completados = i;
    }

    const nivel = Math.max(1, Math.min(total, completados + 2));
    const indiceNivel = nivel - 1;
    const prevCum = indiceNivel > 0 ? cums[indiceNivel - 1] : 0;

    this.player.level = nivel;
    this.player.nextLevelXp = cums[indiceNivel] - prevCum;
    this.player.currentXp = Math.min(Math.max(0, this.xpTotal - prevCum), this.player.nextLevelXp);
  }

  private persistirProgreso(force = false): void {
    const idUsuario = this.authService.obtenerIdUsuario();
    if (!idUsuario || !this.idLenguajeTypeScript) return;

    const datos = {
      id_usuario: idUsuario,
      id_lenguaje: this.idLenguajeTypeScript,
      id_nivel_actual: this.idNiveles[this.player.level - 1] ?? null,
      xp_actual: Math.max(0, Math.round(this.xpTotal)),
      porcentaje: Math.min(100, Math.max(0, Math.round(this.obtenerPorcentajeXp())))
    };

    if (!this.idProgreso) {
      this.progresoService.crear(datos).subscribe({
        next: () => this.sincronizarIdProgreso(idUsuario),
        error: () => undefined
      });
      this.progresoDirty = false;
      return;
    }

    if (!force && !this.progresoDirty) return;

    this.progresoService.actualizar(this.idProgreso, datos).subscribe({
      error: () => undefined
    });
    this.progresoDirty = false;
  }

  private sincronizarIdProgreso(idUsuario: number): void {
    this.progresoService.obtenerPorUsuarioYLenguaje(idUsuario, this.idLenguajeTypeScript).subscribe({
      next: r => {
        const nuevo = Number(r?.data?.id_progreso);
        if (nuevo) this.idProgreso = nuevo;
      },
      error: () => undefined
    });
  }
}
