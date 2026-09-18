import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NivelSql, SeccionSql, JugadorSql } from '../../interfaces/sql.interface';
import { PanelSqlComponent } from './panel-sql/panel-sql.component';
import { ManualTecnicoSqlComponent } from './manual-tecnico-sql/manual-tecnico-sql.component';
import { MisionesSqlComponent } from './misiones-sql/misiones-sql.component';
import { ConsolaSqlComponent } from './consola-sql/consola-sql.component';
import { CuestionariosSqlComponent } from './cuestionarios-sql/cuestionarios-sql.component';
import { DashboardService } from '../../services/dashboard.service';
import { SqlService } from '../../services/sql.service';

@Component({
  selector: 'app-sql',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PanelSqlComponent,
    ManualTecnicoSqlComponent,
    MisionesSqlComponent,
    ConsolaSqlComponent,
    CuestionariosSqlComponent
  ],
  templateUrl: './sql.component.html',
  styleUrls: ['./sql.component.scss']
})
export class SqlComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private sqlService = inject(SqlService);

  seccionActiva = signal<SeccionSql>('panel');
  cargandoJugador = signal(true);
  errorJugador = signal<string | null>(null);
  niveles = signal<NivelSql[]>([]);
  nivelActivo = signal<NivelSql | null>(null);
  cargandoNiveles = signal(true);
  errorNiveles = signal<string | null>(null);

  datosJugador = signal<JugadorSql>({
    nombreJugador: 'Cadete Bit',
    tituloRango: 'Explorador del Valle de Transistores',
    nivelProgreso: 2,
    experienciaActual: 240,
    experienciaSiguienteNivel: 500,
    transistoresActivos: 3,
    totalTransistores: 5,
    estrellasTotales: 12
  });

  mascotDialogue = signal<string>('¡Sintoniza las bobinas de datos, Cadete!');

  ngOnInit(): void {
    this.cargarNiveles();
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: (datos) => {
        const progreso = datos.progresoSql ?? datos.progreso;
        const porcentaje = Math.max(0, Math.min(100, progreso.porcentaje ?? 0));
        const experienciaActual = progreso.xp_actual ?? 0;
        const experienciaSiguienteNivel = porcentaje > 0
          ? Math.max(experienciaActual, Math.ceil(experienciaActual * 100 / porcentaje))
          : 100;

        this.datosJugador.set({
          nombreJugador: datos.usuario.nombre,
          tituloRango: `Explorador SQL - Nivel ${progreso.id_nivel_actual ?? 1}`,
          nivelProgreso: progreso.id_nivel_actual ?? 1,
          experienciaActual,
          experienciaSiguienteNivel,
          transistoresActivos: Math.round(porcentaje / 20),
          totalTransistores: 5,
          estrellasTotales: datos.logrosObtenidos
        });
        this.cargandoJugador.set(false);
      },
      error: () => {
        this.errorJugador.set('No se pudo cargar el progreso real.');
        this.cargandoJugador.set(false);
      }
    });
  }

  cargarNiveles(): void {
    this.sqlService.obtenerNiveles().subscribe({
      next: (niveles) => {
        this.niveles.set(niveles);
        this.nivelActivo.set(niveles[0] ?? null);
        this.cargandoNiveles.set(false);
      },
      error: () => {
        this.errorNiveles.set('No se pudieron cargar los niveles SQL.');
        this.cargandoNiveles.set(false);
      }
    });
  }

  seleccionarNivel(evento: Event): void {
    const numeroNivel = Number((evento.target as HTMLSelectElement).value);
    const nivel = this.niveles().find(item => item.numero_nivel === numeroNivel);
    if (nivel) this.nivelActivo.set(nivel);
  }

  cambiarSeccion(nuevaSeccion: SeccionSql): void {
    this.seccionActiva.set(nuevaSeccion);
  }
}