import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisionSqlConfig, TemaGraficoSql } from '../misiones-sql.data';

export interface PlayoSql {
  palabra: string;
  sub: string;
  clase: 'copper' | 'green' | 'cyan';
}

@Component({
  selector: 'app-manual-tecnico-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manual-tecnico-sql.component.html',
  styleUrls: ['./manual-tecnico-sql.component.scss'],
})
export class ManualTecnicoSqlComponent implements OnChanges {
  @Input() mision: MisionSqlConfig | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  manual = signal<MisionSqlConfig | null>(null);

  private readonly circuitos: Record<TemaGraficoSql, PlayoSql[]> = {
    explorar: [
      { palabra: 'FROM', sub: 'tabla origen', clase: 'copper' },
      { palabra: 'SELECT *', sub: 'todas las columnas', clase: 'cyan' },
    ],
    proyectar: [
      { palabra: 'FROM', sub: 'tabla origen', clase: 'copper' },
      { palabra: 'SELECT', sub: 'columnas concretas', clase: 'cyan' },
    ],
    filtrar: [
      { palabra: 'FROM', sub: 'tabla origen', clase: 'copper' },
      { palabra: 'WHERE', sub: 'condición de filas', clase: 'green' },
      { palabra: 'SELECT', sub: 'proyección', clase: 'cyan' },
    ],
    ordenar: [
      { palabra: 'FROM', sub: 'tabla origen', clase: 'copper' },
      { palabra: 'ORDER BY', sub: 'criterio DESC', clase: 'green' },
      { palabra: 'LIMIT', sub: 'corte de filas', clase: 'cyan' },
    ],
    agregar: [
      { palabra: 'FROM', sub: 'tabla origen', clase: 'copper' },
      { palabra: 'SUM()', sub: 'total acumulado', clase: 'cyan' },
    ],
    agrupar: [
      { palabra: 'FROM', sub: 'tabla origen', clase: 'copper' },
      { palabra: 'GROUP BY', sub: 'formar grupos', clase: 'green' },
      { palabra: 'HAVING', sub: 'filtrar grupos', clase: 'cyan' },
    ],
    unir: [
      { palabra: 'FROM A', sub: 'primera tabla', clase: 'copper' },
      { palabra: 'INNER JOIN B', sub: 'solo coincidencias', clase: 'green' },
      { palabra: 'ON', sub: 'llaves en común', clase: 'cyan' },
    ],
    preservar: [
      { palabra: 'FROM A', sub: 'tabla dominante', clase: 'copper' },
      { palabra: 'LEFT JOIN B', sub: 'conserva A entera', clase: 'green' },
      { palabra: 'ON', sub: 'llaves en común', clase: 'cyan' },
    ],
    subconsulta: [
      { palabra: 'FROM', sub: 'tabla origen', clase: 'copper' },
      { palabra: 'WHERE > ( )', sub: 'comparación anidada', clase: 'green' },
      { palabra: 'AVG()', sub: 'valor escalar', clase: 'cyan' },
    ],
    mutar: [
      { palabra: 'UPDATE', sub: 'tabla objetivo', clase: 'copper' },
      { palabra: 'SET', sub: 'nuevo valor', clase: 'green' },
      { palabra: 'WHERE', sub: 'acotar filas', clase: 'cyan' },
    ],
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mision']) {
      this.manual.set(this.mision);
    }
  }

  chips(): PlayoSql[] {
    const tema = this.manual()?.temaGrafico ?? 'explorar';
    return this.circuitos[tema] ?? this.circuitos['explorar'];
  }

  iconoTema(tema: TemaGraficoSql): string {
    const iconos: Record<TemaGraficoSql, string> = {
      explorar: 'bi-search',
      proyectar: 'bi-view-list',
      filtrar: 'bi-funnel-fill',
      ordenar: 'bi-sort-numeric-down-alt',
      agregar: 'bi-plus-circle-fill',
      agrupar: 'bi-diagram-3-fill',
      unir: 'bi-link-45deg',
      preservar: 'bi-people-fill',
      subconsulta: 'bi-braces',
      mutar: 'bi-pencil-square',
    };
    return iconos[tema] ?? 'bi-diagram-3-fill';
  }
}
