import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { MissionProgressService } from '../../../core/services/mission-progress.service';

export interface ManualParsed {
  conceptual: string;
  logico: string;
  sintactico: string;
}

@Component({
  selector: 'app-ts-data',
  templateUrl: './TS-data.component.html',
  styleUrls: ['./TS-data.component.scss']
})
export class TSDataComponent implements OnChanges {
  @Input() mission: any = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  private readonly missionProgressService = inject(MissionProgressService);

  manual = signal<ManualParsed>({ conceptual: 'Selecciona una misión para cargar el manual.', logico: '...', sintactico: '...' });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission']) {
      this.procesarLeccion();
      if (this.mission?.id_leccion) {
        this.missionProgressService.updateProgress(this.mission.id_leccion, 'manual').subscribe({
          error: () => undefined
        });
      }
    }
  }

  procesarLeccion(): void {
    const contenido = this.mission?.contenido ?? this.mission?.leccionContenido ?? '';
    if (!contenido) return;

    const extraer = (inicio: string, fin?: string) => {
      const idxInicio = contenido.indexOf(inicio);
      if (idxInicio === -1) return '';
      const start = idxInicio + inicio.length;
      if (!fin) return contenido.substring(start).trim();
      const idxFin = contenido.indexOf(fin, start);
      return idxFin === -1 ? contenido.substring(start).trim() : contenido.substring(start, idxFin).trim();
    };

    if (contenido.includes('NIVEL CONCEPTUAL:')) {
      this.manual.set({
        conceptual: extraer('NIVEL CONCEPTUAL:', 'NIVEL LOGICO:') || contenido,
        logico: extraer('NIVEL LOGICO:', 'NIVEL SINTACTICO:'),
        sintactico: extraer('NIVEL SINTACTICO:', 'PROBLEMA ABP:')
      });
      return;
    }

    const oraciones = contenido
      .trim()
      .split(/(?<=[.!?])\s+/)
      .map((oracion: string) => oracion.trim())
      .filter(Boolean);
    const codigosEnLinea = contenido.match(/`([^`]+)`/g)?.map((codigo: string) => codigo.replace(/`/g, '').trim()).filter(Boolean) ?? [];

    this.manual.set({
      conceptual: oraciones[0] || contenido,
      logico: oraciones.slice(1).join(' ') || contenido,
      sintactico: codigosEnLinea.length ? codigosEnLinea.join('\n') : contenido
    });
  }
}