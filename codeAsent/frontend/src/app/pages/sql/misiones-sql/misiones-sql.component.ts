import { Component, Input, OnChanges, Output, EventEmitter, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NivelSql, RetoNivelSql } from '../../../interfaces/sql.interface';

export interface MisionSqlSeleccionada {
  reto: RetoNivelSql;
  nivel: NivelSql;
  leccionContenido: string;
  respuestas: RetoNivelSql['respuestas'];
}

@Component({
  selector: 'app-misiones-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './misiones-sql.component.html',
  styleUrls: ['./misiones-sql.component.scss']
})
export class MisionesSqlComponent implements OnChanges {
  @Input() niveles: NivelSql[] = [];
  @Input() nivelActivo: NivelSql | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() missionSelected = new EventEmitter<any>();

  misiones = signal<Array<MisionSqlSeleccionada & { codigoIdentificador: string; desbloqueada: boolean; completada: boolean }>>([]);

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.niveles.length === 0) return;
    this.misiones.set(this.niveles.map((nivel, indice) => {
      const reto = nivel.retos.find(item => item.tipo_reto === 'codigo') ?? nivel.retos[0] ?? null;
      const desbloqueada = indice === 0 || !!this.nivelActivo || !!reto;
      return {
        reto: reto as RetoNivelSql,
        nivel,
        leccionContenido: nivel.lecciones[0]?.contenido || '',
        respuestas: reto?.respuestas || [],
        codigoIdentificador: `SQL-${String(nivel.numero_nivel).padStart(2, '0')}`,
        desbloqueada: desbloqueada && !!reto,
        completada: false
      };
    }));
  }

  seleccionarMision(mision: MisionSqlSeleccionada & { desbloqueada: boolean }): void {
    if (!mision.desbloqueada || !mision.reto) return;
    const retoParaConsola = {
      ...mision.reto,
      leccionContenido: mision.leccionContenido,
      respuestas: mision.respuestas || mision.reto.respuestas || []
    };
    this.missionSelected.emit(retoParaConsola);
  }
}