import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
        // Normaliza a 100 XP por nivel para SQL (máximo 1000 en 10 misiones) aunque la BD aún tenga valores viejos 50..500
        const normalizados = niveles.map((n) => ({ ...n, xp_requerida: 100 }));
        this.niveles.set(normalizados);
        this.nivelActivo.set(normalizados[0] ?? null);
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
    // Nivel SQL: 100 XP por nivel, 1..10 (0-99 =>1, 100-199=>2, ... 900-1000=>10)
    const nivelCalculado = Math.min(10, Math.max(1, Math.floor(xp / 100) + 1));
    // Si el backend trae nivel_actual coherente úsalo, si no usa el calculado
    const nivelBackend = Number(perfilSql?.nivel_actual ?? nivelCalculado);
    const nivel = Number.isFinite(nivelBackend) && nivelBackend >= 1 && nivelBackend <= 10 ? nivelBackend : nivelCalculado;
    const nivelFinal = Math.max(nivel, nivelCalculado);

    this.datosJugador.update((jugador) => ({
      ...jugador,
      tituloRango: `Explorador SQL - Nivel ${nivelFinal}`,
      nivelProgreso: nivelFinal,
      experienciaActual: xp,
      experienciaSiguienteNivel: 1000,
      transistoresActivos: Math.max(1, Math.min(5, Math.ceil(nivelFinal / 2))),
    }));
  }

  private sincronizarNivelActivo(): void {
    const niveles = this.niveles();
    if (niveles.length === 0) return;
    const perfilSql = this.infoPerfilSql();
    const xp = Number(perfilSql?.xp_actual ?? 0);
    const nivelPorXp = Math.min(10, Math.max(1, Math.floor(xp / 100) + 1));
    const nivelActual = Number(perfilSql?.nivel_actual ?? nivelPorXp);
    const nivelEfectivo = Math.max(nivelActual, nivelPorXp);
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
    const mision = MISIONES_SQL.find((item) => item.numero === numeroMision) ?? MISIONES_SQL[0];
    this.misionActiva.set(mision);
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
    if (missionId) {
      this.missionProgressService
        .updateTerminalStats(missionId, {
          prediccion_correcta: resultado.prediccionCorrecta,
          pistas_usadas: resultado.pistasUsadas,
        })
        .subscribe({ error: () => {} });
    }
    this.cambiarSeccion('cuestionario');
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
          // Desbloquea siempre la siguiente para pruebas, aunque no sea perfecto
          this.marcarMisionCompletada(missionId);
          if (completada) {
            // Optimista: 100 XP fijo por misión SQL (máximo 1000), evita 5500 y resta fantasma
            const awardedRaw = Number(respuesta.data.xp_awarded) || 0;
            const awarded = 100;
            if (awardedRaw > 0) {
              const perfil = this.infoPerfilSql();
              if (perfil) {
                const baseXp = Number(perfil.xp_actual ?? this.datosJugador().experienciaActual ?? 0);
                const nuevoXp = Math.min(1000, baseXp + awarded);
                perfil.xp_actual = nuevoXp;
                perfil.nivel_actual = Math.min(10, Math.max(1, Math.floor(nuevoXp / 100) + 1));
                this.infoPerfilSql.set({ ...perfil });
                this.aplicarHud();
                this.sincronizarNivelActivo();
              } else {
                this.datosJugador.update((j) => ({
                  ...j,
                  experienciaActual: Math.min(1000, j.experienciaActual + awarded),
                  nivelProgreso: Math.min(10, Math.max(1, Math.floor(Math.min(1000, j.experienciaActual + awarded) / 100) + 1)),
                }));
              }
            }
          } else if (respuesta?.data && !completada && esPerfect === false) {
            this.mascotDialogue.set(
              'Necesitas el perfecto en el diagnóstico (todas correctas) para reclamar el XP. La siguiente misión ya está desbloqueada para pruebas.',
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
