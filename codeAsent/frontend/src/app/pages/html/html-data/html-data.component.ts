import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';

export interface ManualParsed {
  conceptual: string;
  logico: string;
  sintactico: string;
}

@Component({
  selector: 'app-html-data',
  templateUrl: './html-data.component.html',
  styleUrls: ['./html-data.component.scss']
})
export class HtmlDataComponent implements OnChanges {
  @Input() leccionRaw: string = '';
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  manual = signal<ManualParsed>({ conceptual: 'Selecciona una misión para cargar el manual.', logico: '...', sintactico: '...' });

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
      logico: extraer('NIVEL LOGICO:', 'NIVEL SINTACTICO:'),
      sintactico: extraer('NIVEL SINTACTICO:', 'PROBLEMA ABP:')
    });
  }
}