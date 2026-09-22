import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NivelSql, SeccionSql, JugadorSql, RetoNivelSql } from '../../interfaces/sql.interface';
import { PanelSqlComponent } from './panel-sql/panel-sql.component';
import { ManualTecnicoSqlComponent } from './manual-tecnico-sql/manual-tecnico-sql.component';
import { MisionesSqlComponent } from './misiones-sql/misiones-sql.component';
import { ConsolaSqlComponent } from './consola-sql/consola-sql.component';
import { CuestionariosSqlComponent } from './cuestionarios-sql/cuestionarios-sql.component';
import { DashboardService } from '../../services/dashboard.service';
import { SqlService } from '../../services/sql.service';
import { obtenerUrlAvatar } from '../../utils/avatar.util';

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

  seccionActiva = signal<SeccionSql | 'leccion'>('panel');
  cargandoJugador = signal(true);
  errorJugador = signal<string | null>(null);
  niveles = signal<NivelSql[]>([]);
  nivelActivo = signal<NivelSql | null>(null);

  retoSeleccionado = signal<RetoNivelSql | null>(null);
  leccionActual = signal<string>('');

  seccionesConMision: Array<SeccionSql | 'leccion'> = ['manual', 'leccion', 'consola', 'cuestionario'];

  datosJugador = signal<JugadorSql>({
    nombreJugador: '',
    tituloRango: 'Explorador del Valle de Transistores',
    nivelProgreso: 2,
    experienciaActual: 240,
    experienciaSiguienteNivel: 500,
    transistoresActivos: 3,
    totalTransistores: 5,
    estrellasTotales: 12
  });

  mascotDialogue = signal<string>('¡Sintoniza las bobinas de datos, Cadete!');

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }

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
        this.datosJugador.update(jugador => ({
          ...jugador,
          nivelProgreso: niveles[0]?.numero_nivel ?? jugador.nivelProgreso
        }));
      },
      error: () => this.errorJugador.set('No se pudieron cargar los niveles SQL.')
    });
  }

  cambiarSeccion(nuevaSeccion: SeccionSql | 'leccion'): void {
    if (this.seccionesConMision.includes(nuevaSeccion) && this.retoSeleccionado() === null) {
      this.seccionActiva.set('misiones');
      this.mascotDialogue.set('Primero elige una misión para activar esa estación, Cadete.');
      return;
    }
    this.seccionActiva.set(nuevaSeccion);
    const dialogos: Record<string, string> = {
      panel: 'El Valle de Transistores está operativo. Elige tu estación.',
      misiones: 'Selecciona una misión para activar la red de datos.',
      manual: 'Estudia el Manual Técnico antes de operar la terminal.',
      leccion: 'Lee la lección y relaciona el concepto con la misión.',
      consola: 'La terminal de cobre está lista para tus consultas.',
      cuestionario: 'Demuestra lo aprendido en la prueba de calibración.'
    };
    this.mascotDialogue.set(dialogos[nuevaSeccion] ?? this.mascotDialogue());
  }

  seleccionarReto(reto: RetoNivelSql): void {
    this.retoSeleccionado.set(reto);
    this.leccionActual.set((reto as any).leccionContenido || '');
    const nivelMision = this.niveles().find(nivel => nivel.retos.some(item => item.id_reto === reto.id_reto));
    if (nivelMision && this.nivelActivo()?.id_nivel !== nivelMision.id_nivel) {
      this.nivelActivo.set(nivelMision);
    }
    this.cambiarSeccion('manual');
  }

  consolaCompletada(): void {
    this.cambiarSeccion('cuestionario');
  }

  sumarXp(xp: number): void {
    if (xp <= 0) return;
    this.datosJugador.update(jugador => ({
      ...jugador,
      experienciaActual: jugador.experienciaActual + xp
    }));
  }
}