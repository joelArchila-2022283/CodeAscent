import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ManualParsedSql {
  conceptual: string;
  logico: string;
  sintactico: string;
}

@Component({
  selector: 'app-manual-tecnico-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manual-tecnico-sql.component.html',
  styleUrls: ['./manual-tecnico-sql.component.scss']
})
export class ManualTecnicoSqlComponent implements OnChanges {
  @Input() leccionRaw: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  manual = signal<ManualParsedSql>({
    conceptual: 'Selecciona una misión para cargar el manual técnico.',
    logico: '...',
    sintactico: '...'
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leccionRaw']) {
      this.procesarLeccion();
    }
  }

  procesarLeccion(): void {
    if (!this.leccionRaw) return;

    const extraer = (inicio: string, fin?: string) => {
      const idxInicio = this.leccionRaw.indexOf(inicio);
      if (idxInicio === -1) return '';
      const start = idxInicio + inicio.length;
      if (!fin) return this.leccionRaw.substring(start).trim();
      const idxFin = this.leccionRaw.indexOf(fin, start);
      return idxFin === -1 ? this.leccionRaw.substring(start).trim() : this.leccionRaw.substring(start, idxFin).trim();
    };

    this.manual.set({
      conceptual: extraer('NIVEL CONCEPTUAL:', 'NIVEL LOGICO:') || this.leccionRaw,
      logico: extraer('NIVEL LOGICO:', 'NIVEL SINTACTICO:') || 'Analiza cómo se conectan las tablas, las claves y los filtros que resuelven el problema.',
      sintactico: extraer('NIVEL SINTACTICO:', 'PROBLEMA ABP:') || 'Escribe la consulta SQL en la terminal y comprueba el resultado esperado.'
    });
  }
}