import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { RetoSql, SeccionSql } from '../interfaces/sql.interface';

@Injectable({
  providedIn: 'root'
})
export class SqlEstadoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sql`;

  private seccionActual: SeccionSql = 'panel';
  private retoActivo: RetoSql | null = null;
  private nivelActualUsuario = 1;
  private xpActualUsuario = 0;
  private xpSiguienteNivel = 500;

  obtenerSeccion(): SeccionSql {
    return this.seccionActual;
  }

  establecerProgresoUsuario(progreso?: { id_nivel_actual?: number | null; xp_actual?: number | null } | null): void {
    const nivelActual = Number(progreso?.id_nivel_actual ?? 1);
    const xpActual = Number(progreso?.xp_actual ?? 0);

    this.nivelActualUsuario = Number.isFinite(nivelActual) && nivelActual > 0 ? nivelActual : 1;
    this.xpActualUsuario = Number.isFinite(xpActual) && xpActual >= 0 ? xpActual : 0;
    this.xpSiguienteNivel = Math.max(100, this.nivelActualUsuario * 150);
  }

  obtenerNivelActual(): number {
    return this.nivelActualUsuario;
  }

  obtenerXpActual(): number {
    return this.xpActualUsuario;
  }

  obtenerXpSiguienteNivel(): number {
    return this.xpSiguienteNivel;
  }

  establecerSeccion(nuevaSeccion: SeccionSql): void {
    this.seccionActual = nuevaSeccion;
  }

  obtenerRetoActivo(): RetoSql | null {
    return this.retoActivo;
  }

  establecerRetoActivo(reto: RetoSql | null): void {
    this.retoActivo = reto;
  }

  hayRetoActivo(): boolean {
    return this.retoActivo !== null;
  }

  obtenerNivelesDesdeBackend(): Observable<RetoSql[]> {
    return this.http.get<{ status: string; data: any[] }>(`${this.apiUrl}/niveles`).pipe(
      map(({ data }) => {
        const niveles = (data ?? []).map((nivel: any) => {
          const retoPrincipal = Array.isArray(nivel.retos) && nivel.retos.length > 0 ? nivel.retos[0] : {};
          const numeroNivel = Number(nivel.numero_nivel ?? nivel.id_nivel ?? 1);
          const estado = (nivel.estado_progreso ?? 'bloqueada') as 'completada' | 'en_progreso' | 'bloqueada';
          const desbloqueado = Boolean(nivel.desbloqueado);

          return {
            id_reto: Number(retoPrincipal.id_reto ?? nivel.id_nivel ?? 0),
            id_nivel: Number(nivel.id_nivel ?? retoPrincipal.id_nivel ?? 0),
            titulo_reto: retoPrincipal.titulo ?? nivel.nombre ?? `Nivel SQL ${numeroNivel}`,
            contexto_abp: retoPrincipal.contexto_abp ?? nivel.descripcion ?? retoPrincipal.descripcion ?? 'Consulta SQL',
            esquema_bd: retoPrincipal.esquema_bd ?? '',
            meta_resolver: retoPrincipal.descripcion ?? nivel.descripcion ?? 'Resolver la misión SQL.',
            xp_recompensa: Number(retoPrincipal.xp_recompensa ?? nivel.xp_requerida ?? 0),
            dificultad: this.normalizarDificultad(retoPrincipal.dificultad ?? nivel.dificultad),
            pistas_disponibles: Array.isArray(retoPrincipal.pistas)
              ? retoPrincipal.pistas.map((pista: unknown) => String(pista))
              : [],
            respuestas_validas: Array.isArray(retoPrincipal.respuestas)
              ? retoPrincipal.respuestas.filter((respuesta: any) => respuesta.es_correcta).map((respuesta: any) => String(respuesta.contenido ?? ''))
              : [],
            ejemplos_visuales: Array.isArray(nivel.lecciones)
              ? nivel.lecciones.flatMap((leccion: any) => leccion.ejemplos ?? [])
              : [],
            manual_tecnico: Array.isArray(nivel.lecciones)
              ? nivel.lecciones.map((leccion: any) => leccion.manual_tecnico).filter(Boolean).join('\n\n')
              : '',
            desbloqueado,
            completado: Boolean(nivel.completado ?? false),
            estado_progreso: estado,
            nombre_nivel: nivel.nombre ?? `Nivel ${numeroNivel}`
          } satisfies RetoSql;
        });

        return niveles;
      }),
      catchError((error) => {
        console.error('No se pudieron cargar las misiones SQL:', error);
        return throwError(() => error);
      })
    );
  }

  enviarRespuesta(idReto: number, respuestaUsuario: string): Observable<{ correcto: boolean; nivelCompletado: boolean; xpObtenida: number; xpTotal: number }> {
    return this.http.post<{ status: string; data: { correcto: boolean; nivelCompletado: boolean; xpObtenida?: number; xpTotal?: number } }>(
      `${this.apiUrl}/respuestas`,
      { id_reto: idReto, respuesta_usuario: respuestaUsuario }
    ).pipe(
      map((respuesta) => ({
        correcto: Boolean(respuesta.data?.correcto),
        nivelCompletado: Boolean(respuesta.data?.nivelCompletado),
        xpObtenida: Number(respuesta.data?.xpObtenida ?? 0),
        xpTotal: Number(respuesta.data?.xpTotal ?? this.xpActualUsuario)
      })),
      catchError(() => of({ correcto: false, nivelCompletado: false, xpObtenida: 0, xpTotal: this.xpActualUsuario }))
    );
  }

  private normalizarDificultad(valor?: string): 'Fácil' | 'Media' | 'Difícil' {
    const valorNormalizado = (valor ?? '').toLowerCase();

    if (valorNormalizado.includes('dificil')) return 'Difícil';
    if (valorNormalizado.includes('media')) return 'Media';
    return 'Fácil';
  }
}