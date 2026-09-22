import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { IMission } from '../../../core/models/language.model';

export interface ManualParsedTS {
  conceptual: string;
  logico: string;
  sintactico: string;
}

@Component({
  selector: 'app-ts-data',
  standalone: true,
  templateUrl: './TS-data.component.html',
  styleUrl: './TS-data.component.scss'
})
export class TSDataComponent implements OnChanges {
  @Input() mission: IMission | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  manual = signal<ManualParsedTS>({
    conceptual: 'Selecciona una misión para cargar el manual.',
    logico: '...',
    sintactico: '...'
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission']) {
      this.procesarLeccion();
    }
  }

  private procesarLeccion(): void {
    const contenido = this.mission?.contenido ?? '';
    if (!contenido) {
      this.manual.set({
        conceptual: 'Selecciona una misión para cargar el manual.',
        logico: '...',
        sintactico: '...'
      });
      return;
    }

    const extraer = (inicio: string, fin?: string): string => {
      const inicioIndex = contenido.toUpperCase().indexOf(inicio);
      if (inicioIndex === -1) return '';
      const inicioContenido = inicioIndex + inicio.length;
      const finIndex = fin
        ? contenido.toUpperCase().indexOf(fin, inicioContenido)
        : -1;
      return contenido
        .substring(inicioContenido, finIndex === -1 ? contenido.length : finIndex)
        .trim();
    };

    const conceptual = extraer('NIVEL CONCEPTUAL:', 'NIVEL LOGICO:') || contenido;
    const logico = extraer('NIVEL LOGICO:', 'NIVEL SINTACTICO:') || contenido;
    const sintactico = extraer('NIVEL SINTACTICO:', 'PROBLEMA ABP:') || contenido;
    this.manual.set({ conceptual, logico, sintactico });
  }
}
