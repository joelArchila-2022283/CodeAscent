import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { SqlEstadoService } from '../../../services/sql-estado.service';
import { obtenerUrlAvatar } from '../../../utils/avatar.util';
import { RetoSql, SeccionSql } from '../../../interfaces/sql.interface';
import { SqlDashboardSectionComponent } from '../sql-dashboard/sql-dashboard-section.component';
import { SqlDataComponent } from '../sql-data/sql-data.component';
import { SqlProcessesComponent } from '../sql-processes/sql-processes.component';
import { SqlTerminalComponent } from '../sql-terminal/sql-terminal.component';
import { SqlTestComponent } from '../sql-test/sql-test.component';

@Component({
  selector: 'app-sql-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SqlDashboardSectionComponent,
    SqlDataComponent,
    SqlProcessesComponent,
    SqlTerminalComponent,
    SqlTestComponent
  ],
  templateUrl: './sql-dashboard.component.html',
  styleUrls: ['./sql-dashboard.component.scss']
})
export class SqlDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly sqlEstadoService = inject(SqlEstadoService);

  seccionActual: SeccionSql = 'panel';
  player = {
    name: '',
    level: 1,
    currentXp: 0,
    nextLevelXp: 500,
    energyWatts: 86
  };
  jugadorCargando = true;
  mensajeFlujo = '';

  ngOnInit(): void {
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: (data: any) => {
        if (data?.usuario?.nombre) {
          this.player.name = data.usuario.nombre;
        }

        const progresoSql = data?.progresoSql ?? data?.progreso ?? null;
        this.player.currentXp = Math.max(0, Number(progresoSql?.xp_actual ?? 0));
        this.player.level = Math.max(1, Number(progresoSql?.id_nivel_actual ?? 1));
        this.player.nextLevelXp = Math.max(100, this.player.level * 150);

        this.sqlEstadoService.establecerProgresoUsuario(progresoSql);
        this.jugadorCargando = false;
      },
      error: (err) => {
        console.error('Error al cargar usuario SQL:', err);
        this.jugadorCargando = false;
      }
    });
  }

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }

  cambiarSeccion(nuevaSeccion: SeccionSql) {
    if (['manual', 'evaluacion', 'consola'].includes(nuevaSeccion) && !this.sqlEstadoService.hayRetoActivo()) {
      this.seccionActual = 'misiones';
      this.mensajeFlujo = 'Selecciona una misión desbloqueada para abrir su manual, evaluación y terminal.';
      return;
    }
    this.seccionActual = nuevaSeccion;
    this.mensajeFlujo = '';
    this.sqlEstadoService.establecerSeccion(nuevaSeccion);
  }

  seleccionarReto(reto: RetoSql): void {
    this.sqlEstadoService.establecerRetoActivo(reto);
    this.cambiarSeccion('manual');
  }

  tieneRetoActivo(): boolean {
    return this.sqlEstadoService.hayRetoActivo();
  }

  actualizarXp(progreso: { xpTotal: number }): void {
    this.player.currentXp = Math.max(this.player.currentXp, Number(progreso.xpTotal || 0));
    this.player.nextLevelXp = Math.max(100, this.player.level * 150);
  }

  obtenerPorcentajeXp(): number {
    if (!Number.isFinite(this.player.currentXp) || !Number.isFinite(this.player.nextLevelXp) || this.player.nextLevelXp <= 0) return 0;
    return Math.min(100, Math.max(0, (this.player.currentXp / this.player.nextLevelXp) * 100));
  }
}