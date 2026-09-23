import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NivelSql, RetoNivelSql } from '../../../interfaces/sql.interface';
import { MISIONES_SQL, MisionSqlConfig } from '../misiones-sql.data';

export interface MisionSqlSeleccionada {
  reto: RetoNivelSql;
  nivel: NivelSql;
  mision: MisionSqlConfig;
  leccionContenido: string;
  respuestas: RetoNivelSql['respuestas'];
}

export interface MisionSqlItem extends MisionSqlSeleccionada {
  codigoIdentificador: string;
  idLeccion: number | null;
  xpRecompensa: number;
  desbloqueada: boolean;
  completada: boolean;
}

@Component({
  selector: 'app-misiones-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './misiones-sql.component.html',
  styleUrls: ['./misiones-sql.component.scss'],
})
export class MisionesSqlComponent implements OnChanges {
  @Input() niveles: NivelSql[] = [];
  @Input() nivelActivo: NivelSql | null = null;
  @Input() completadas: ReadonlySet<number> = new Set<number>();
  @Output() back = new EventEmitter<void>();
  @Output() missionSelected = new EventEmitter<RetoNivelSql>();

  misiones = signal<MisionSqlItem[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['niveles'] && !changes['nivelActivo'] && !changes['completadas']) return;
    if (this.niveles.length === 0) return;

    const nivelesOrdenados = [...this.niveles].sort(
      (a, b) => a.numero_nivel - b.numero_nivel,
    );

    this.misiones.set(
      nivelesOrdenados.map((nivel, indice) => {
        const mision =
          MISIONES_SQL.find((item) => item.numero === nivel.numero_nivel) ??
          MISIONES_SQL[Math.min(indice, MISIONES_SQL.length - 1)];
        const leccion = nivel.lecciones[0];
        const retoBase = nivel.retos.find((item) => item.tipo_reto === 'codigo') ?? nivel.retos[0];

        const reto: RetoNivelSql = {
          id_reto: retoBase?.id_reto ?? mision.numero,
          id_leccion: leccion?.id_leccion ?? retoBase?.id_leccion ?? 0,
          titulo: retoBase?.titulo ?? mision.titulo,
          descripcion: retoBase?.descripcion ?? mision.objetivoClaro,
          tipo_reto: 'codigo',
          xp_recompensa: Number(nivel.xp_requerida ?? 0) || mision.xpRecompensa,
          dificultad:
            retoBase?.dificultad ??
            (mision.numero <= 3 ? 'facil' : mision.numero <= 7 ? 'medio' : 'dificil'),
          respuestas: retoBase?.respuestas?.length ? retoBase.respuestas : [],
        };

        const nivelAnterior = nivelesOrdenados[indice - 1];
        const idLeccionAnterior = nivelAnterior?.lecciones[0]?.id_leccion;
        const desbloqueada = indice === 0 || (
          idLeccionAnterior !== undefined &&
          this.completadas.has(idLeccionAnterior)
        );

        return {
          reto,
          nivel,
          mision,
          leccionContenido: leccion?.contenido || mision.contexto,
          respuestas: reto.respuestas,
          codigoIdentificador: mision.codigo,
          idLeccion: leccion?.id_leccion ?? null,
          xpRecompensa: reto.xp_recompensa,
          desbloqueada,
          completada: this.completadas.has(reto.id_leccion),
        };
      }),
    );
  }

  seleccionarMision(item: MisionSqlItem): void {
    if (!item.desbloqueada || !item.reto) return;
    const retoParaConsola: RetoNivelSql = {
      ...item.reto,
      numero_nivel: item.nivel.numero_nivel,
      leccionContenido: item.leccionContenido,
      respuestas: item.respuestas ?? item.reto.respuestas ?? [],
    };
    this.missionSelected.emit(retoParaConsola);
  }
}
