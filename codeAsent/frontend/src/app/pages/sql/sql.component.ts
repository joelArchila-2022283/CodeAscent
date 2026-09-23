import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { NivelSql, SeccionSql, JugadorSql, RetoNivelSql } from '../../interfaces/sql.interface';
import { PerfilLenguaje } from '../../interfaces/usuario.interface';
import { PanelSqlComponent } from './panel-sql/panel-sql.component';
import { ManualTecnicoSqlComponent } from './manual-tecnico-sql/manual-tecnico-sql.component';
import { MisionesSqlComponent } from './misiones-sql/misiones-sql.component';
import { ConsolaSqlComponent, ResultadoConsolaSql } from './consola-sql/consola-sql.component';
import {
  CuestionariosSqlComponent,
  ResultadoCuestionarioSql,
} from './cuestionarios-sql/cuestionarios-sql.component';
import { DashboardService } from '../../services/dashboard.service';
import { SqlService } from '../../services/sql.service';
import { MissionProgressService } from '../../core/services/mission-progress.service';
import { MISIONES_SQL, MisionSqlConfig } from './misiones-sql.data';
import { obtenerUrlAvatar } from '../../utils/avatar.util';

const XP_POR_MISION_SQL = 100;

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
    CuestionariosSqlComponent,
  ],
  templateUrl: './sql.component.html',
  styleUrls: ['./sql.component.scss'],
})
export class SqlComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private sqlService = inject(SqlService);
  private missionProgressService = inject(MissionProgressService);

  seccionActiva = signal<SeccionSql | 'leccion'>('panel');
  cargandoJugador = signal(true);
  errorJugador = signal<string | null>(null);
  niveles = signal<NivelSql[]>([]);
  nivelActivo = signal<NivelSql | null>(null);

  retoSeleccionado = signal<RetoNivelSql | null>(null);
  misionActiva = signal<MisionSqlConfig | null>(null);
  misionesCompletadas = signal<Set<number>>(new Set());

  seccionesConMision: Array<SeccionSql | 'leccion'> = [
    'manual',
    'leccion',
    'consola',
    'cuestionario',
  ];

  private infoPerfilSql = signal<PerfilLenguaje | null>(null);

  datosJugador = signal<JugadorSql>({
    nombreJugador: '',
    tituloRango: 'Explorador del Valle de Transistores',
    nivelProgreso: 1,
    experienciaActual: 0,
    experienciaSiguienteNivel: 100,
    transistoresActivos: 1,
    totalTransistores: 5,
    estrellasTotales: 0,
  });

  mascotDialogue = signal<string>('¡Sintoniza las bobinas de datos, Cadete!');

  obtenerUrlAvatar(nombre: string | undefined): string {
    return obtenerUrlAvatar(nombre);
  }

  ngOnInit(): void {
    this.cargarNiveles();
    this.cargarProgresoReal();
  }

  cargarNiveles(): void {
    this.sqlService.obtenerNiveles().subscribe({
      next: (niveles) => {
        const ordenados = [...niveles].sort((a, b) => a.numero_nivel - b.numero_nivel);
        this.niveles.set(ordenados);
        this.nivelActivo.set(ordenados[0] ?? null);
        this.aplicarHud();
        this.sincronizarNivelActivo();
        this.precargarMisionesCompletadas();
      },
      error: () => this.errorJugador.set('No se pudieron cargar los niveles SQL.'),
    });
  }

  cargarProgresoReal(): void {
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: (datos) => {
        const perfilSql =
          datos.perfil?.lenguajes.find((lenguaje) => lenguaje.nombre.toLowerCase() === 'sql') ??
          null;
        this.infoPerfilSql.set(perfilSql);
        this.datosJugador.update((jugador) => ({
          ...jugador,
          nombreJugador: datos.usuario.nombre,
          estrellasTotales: datos.logrosObtenidos,
        }));
        this.aplicarHud();
        this.sincronizarNivelActivo();
        this.cargandoJugador.set(false);
      },
      error: () => {
        this.errorJugador.set('No se pudo cargar el progreso real.');
        this.cargandoJugador.set(false);
      },
    });
  }

  aplicarHud(): void {
    const perfilSql = this.infoPerfilSql();
    const xp = Number(perfilSql?.xp_actual ?? 0);
    const nivelFinal = this.nivelPorXp(xp);
    const niveles = this.niveles();
    const indice = Math.max(0, Math.min(niveles.length - 1, nivelFinal - 1));
    const nivelActual = niveles[indice];
    const inicio = niveles
      .slice(0, indice)
      .reduce((total, nivel) => total + Number(nivel.xp_requerida ?? 0), 0);
    const costo = XP_POR_MISION_SQL;
    const xpDelNivel = Math.max(0, Math.min(costo, xp - inicio));

    this.datosJugador.update((jugador) => ({
      ...jugador,
      tituloRango: `Explorador SQL - Nivel ${nivelFinal}`,
      nivelProgreso: nivelFinal,
      experienciaActual: xpDelNivel,
      experienciaSiguienteNivel: costo,
      transistoresActivos: Math.max(1, Math.min(5, Math.ceil(nivelFinal / 2))),
    }));
  }

  porcentajeExperiencia(): number {
    const jugador = this.datosJugador();
    if (jugador.experienciaSiguienteNivel <= 0) return 0;
    return Math.min(100, Math.max(0, (jugador.experienciaActual / jugador.experienciaSiguienteNivel) * 100));
  }

  xpTotalSql(): number {
    return Number(this.infoPerfilSql()?.xp_actual || 0);
  }

  private nivelPorXp(xp: number): number {
    let acumulado = 0;
    let nivel = 1;
    for (const [indice, actual] of this.niveles().entries()) {
      const costo = Number(actual.xp_requerida ?? 0);
      if (xp < acumulado + costo) {
        return indice + 1;
      }
      acumulado += costo;
      nivel = Math.min(this.niveles().length, indice + 2);
    }
    return nivel;
  }

  private sincronizarNivelActivo(): void {
    const niveles = this.niveles();
    if (niveles.length === 0) return;
    const perfilSql = this.infoPerfilSql();
    const xp = Number(perfilSql?.xp_actual ?? 0);
    const nivelPorXp = this.nivelPorXp(xp);
    const nivelEfectivo = Math.max(Number(perfilSql?.nivel_actual ?? nivelPorXp), nivelPorXp);
    const completadas = this.misionesCompletadas();

    // Nivel por XP/perfil
    let candidato = niveles.find((n) => n.numero_nivel === nivelEfectivo) ?? niveles[0];

    // Nivel por misiones completadas: desbloquea el siguiente al último completado
    let maxCompletado = 0;
    niveles.forEach((nivel) => {
      const leccionId = nivel.lecciones[0]?.id_leccion;
      if (leccionId !== null && leccionId !== undefined && completadas.has(leccionId)) {
        maxCompletado = Math.max(maxCompletado, nivel.numero_nivel);
      }
    });
    if (maxCompletado > 0) {
      const siguiente = niveles.find((n) => n.numero_nivel === maxCompletado + 1);
      if (siguiente) {
        if (siguiente.numero_nivel > (candidato?.numero_nivel ?? 0)) {
          candidato = siguiente;
        }
      } else {
        candidato = niveles[niveles.length - 1];
      }
    }

    if (candidato) this.nivelActivo.set(candidato);
  }

  precargarMisionesCompletadas(): void {
    this.niveles().forEach((nivel) => {
      const leccion = nivel.lecciones[0];
      if (!leccion) return;
      this.missionProgressService.getProgress(leccion.id_leccion).subscribe({
        next: (respuesta) => {
          if (respuesta.data.completed) {
            this.marcarMisionCompletada(leccion.id_leccion);
          }
        },
        error: () => {},
      });
    });
  }

  marcarMisionCompletada(idLeccion: number): void {
    this.misionesCompletadas.update((completadas) => {
      const nuevo = new Set(completadas);
      nuevo.add(idLeccion);
      return nuevo;
    });
    // Desbloquea el siguiente nivel inmediatamente en el UI
    this.sincronizarNivelActivo();
  }

  cambiarSeccion(nuevaSeccion: SeccionSql | 'leccion'): void {
    if (this.seccionesConMision.includes(nuevaSeccion) && this.retoSeleccionado() === null) {
      this.seccionActiva.set('misiones');
      this.mascotDialogue.set('Primero elige una misión para activar esa estación, Cadete.');
      return;
    }
    this.seccionActiva.set(nuevaSeccion);
    this.registrarPasoProgreso(nuevaSeccion);
    const dialogos: Record<string, string> = {
      panel: 'El Valle de Transistores está operativo. Elige tu estación.',
      misiones: 'Selecciona una misión para activar la red de datos.',
      manual: 'Estudia el Manual Técnico antes de operar la terminal.',
      leccion: 'Lee la lección y relaciona el concepto con la misión.',
      consola: 'La terminal de cobre está lista para tus consultas.',
      cuestionario: 'Demuestra lo aprendido en la prueba de calibración.',
    };
    this.mascotDialogue.set(dialogos[nuevaSeccion] ?? this.mascotDialogue());
  }

  private registrarPasoProgreso(seccion: SeccionSql | 'leccion'): void {
    const reto = this.retoSeleccionado();
    const missionId = reto?.id_leccion;
    if (!missionId) return;
    const pasos: Record<string, string> = {
      leccion: 'lesson',
      consola: 'terminal',
      cuestionario: 'quiz',
    };
    const paso = pasos[seccion];
    if (!paso) return;
    this.missionProgressService.updateProgress(missionId, paso).subscribe({ error: () => {} });
  }

  seleccionarReto(reto: RetoNivelSql): void {
    this.retoSeleccionado.set(reto);
    const numeroMision = reto.numero_nivel ?? this.nivelActivo()?.numero_nivel ?? 1;
    const nivelMision = this.niveles().find((nivel) => nivel.numero_nivel === numeroMision);
    if (nivelMision) {
      this.nivelActivo.set(nivelMision);
    }
    const mision = MISIONES_SQL.find((item) => item.numero === numeroMision);
    if (!mision || !nivelMision?.lecciones[0]) {
      this.mascotDialogue.set('Esta misión todavía no tiene una lección activa en el servidor.');
      return;
    }
    this.misionActiva.set({
      ...mision,
      xpRecompensa: XP_POR_MISION_SQL,
    });
    const missionId = reto.id_leccion;
    if (missionId) {
      this.missionProgressService
        .updateProgress(missionId, 'manual')
        .subscribe({ error: () => {} });
    }
    this.cambiarSeccion('manual');
  }

  consolaCompletada(resultado: ResultadoConsolaSql): void {
    const missionId = resultado.retoId;
    if (!missionId) {
      this.cambiarSeccion('cuestionario');
      return;
    }

    this.missionProgressService.updateProgress(missionId, 'terminal').pipe(
      switchMap(() => this.missionProgressService.updateTerminalStats(missionId, {
        prediccion_correcta: resultado.prediccionCorrecta,
        pistas_usadas: resultado.pistasUsadas,
        codigo: resultado.codigo,
      }).pipe(catchError(() => of(null)))),
      switchMap(() => this.missionProgressService.updateProgress(missionId, 'quiz')),
    ).subscribe({
      next: () => this.cambiarSeccion('cuestionario'),
      error: () => this.mascotDialogue.set('No se pudo registrar la consola. Ejecuta nuevamente la consulta antes de abrir el diagnóstico.'),
    });
  }

  misionDiagnosticoCompletado(resultado: ResultadoCuestionarioSql): void {
    const missionId = resultado.missionId;
    if (!missionId) return;

    // Asegura que el paso 'quiz' quede registrado antes de pedir el premio (evita 409 por carrera)
    this.missionProgressService.updateProgress(missionId, 'quiz').subscribe({
      next: () => this.enviarComplete(missionId, resultado),
      error: () => this.enviarComplete(missionId, resultado),
    });
  }

  private enviarComplete(missionId: number, resultado: ResultadoCuestionarioSql): void {
    this.missionProgressService
      .completeMission(missionId, resultado.correct, resultado.total, 'quiz')
      .subscribe({
        next: (respuesta) => {
          const esPerfect = respuesta?.data?.perfect !== false && respuesta?.data?.correct === respuesta?.data?.total;
          const completada = !!respuesta?.data?.completed;
          if (completada) {
            this.marcarMisionCompletada(missionId);
            // Optimista: 100 XP fijo por misión SQL (máximo 1000), evita 5500 y resta fantasma
          } else if (respuesta?.data && !completada && esPerfect === false) {
            this.mascotDialogue.set(
              'Necesitas acertar todo el diagnóstico para reclamar el XP y desbloquear la siguiente misión.',
            );
          }
          // Siempre recarga el progreso real para sincronizar con el backend (corrige 5500→1000)
          this.cargarProgresoReal();
        },
        error: (err) => {
          const msg = err?.error?.message ?? '';
          if (msg.includes('desbloqueado') || msg.includes('quiz')) {
            // Reintenta una vez tras forzar el paso quiz
            this.missionProgressService.updateProgress(missionId, 'quiz').subscribe({
              next: () =>
                this.missionProgressService
                  .completeMission(missionId, resultado.correct, resultado.total, 'quiz')
                  .subscribe({
                    next: (r2) => {
                      if (r2?.data?.completed) this.marcarMisionCompletada(missionId);
                      this.cargarProgresoReal();
                    },
                    error: () =>
                      this.mascotDialogue.set(
                        'No se pudo registrar la misión. Revisa que el cuestionario esté en estado quiz.',
                      ),
                  }),
              error: () =>
                this.mascotDialogue.set(
                  'No se pudo registrar la misión en el servidor, pero tu diagnóstico quedó resuelto.',
                ),
            });
          } else {
            this.mascotDialogue.set(
              'No se pudo registrar la misión en el servidor, pero tu diagnóstico quedó resuelto.',
            );
          }
        },
      });
  }
}
