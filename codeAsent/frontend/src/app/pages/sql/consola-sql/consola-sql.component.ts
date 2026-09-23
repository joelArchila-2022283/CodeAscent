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
import { MisionSqlConfig } from '../misiones-sql.data';

export interface ResultadoConsolaSql {
  retoId: number;
  xp: number;
  prediccionCorrecta: boolean;
  pistasUsadas: number;
}

@Component({
  selector: 'app-consola-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consola-sql.component.html',
  styleUrls: ['./consola-sql.component.scss'],
})
export class ConsolaSqlComponent implements OnChanges {
  @Input() mision: MisionSqlConfig | null = null;
  @Input() idLeccion: number | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() missionCompleted = new EventEmitter<ResultadoConsolaSql>();

  etapaActual = signal<number>(1);
  prediccionSeleccionada = signal<number | null>(null);
  prediccionCorrecta = signal<boolean | null>(null);
  codigoIngresado = signal<string>('');
  pistasSolicitadas = signal<number>(0);
  estrellasRestantes = signal<number>(4);
  resultadoEjecucion = signal<string | null>(null);
  ejecucionExitosa = signal<boolean>(false);
  filasResultado = signal<Array<Record<string, unknown>>>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['mision']) return;
    this.reiniciar();
  }

  private reiniciar(): void {
    this.etapaActual.set(1);
    this.prediccionSeleccionada.set(null);
    this.prediccionCorrecta.set(null);
    this.pistasSolicitadas.set(0);
    this.estrellasRestantes.set(4);
    this.codigoIngresado.set('');
    this.resultadoEjecucion.set(null);
    this.ejecucionExitosa.set(false);
    this.filasResultado.set([]);
  }

  validarPrediccion(indiceOpcion: number): void {
    if (!this.mision) return;
    this.prediccionSeleccionada.set(indiceOpcion);
    const esCorrecto = indiceOpcion === this.mision.indicePrediccionCorrecta;
    this.prediccionCorrecta.set(esCorrecto);
  }

  avanzarAEditor(): void {
    this.etapaActual.set(3);
  }

  actualizarCodigo(evento: Event): void {
    const elemento = evento.target as HTMLTextAreaElement;
    this.codigoIngresado.set(elemento.value);
  }

  solicitarPista(): void {
    if (!this.mision) return;
    const actual = this.pistasSolicitadas();
    if (actual < this.mision.pistas.length) {
      this.pistasSolicitadas.set(actual + 1);
      this.estrellasRestantes.update((estrellas) => Math.max(0, estrellas - 1));
    }
  }

  nombrePista(nivelPista: number): string {
    const nombres = ['Conceptual', 'Orientativa', 'Específica', 'Casi Solución'];
    return nombres[nivelPista - 1] ?? `Pista ${nivelPista}`;
  }

  normalizarConsulta(input: string): string {
    return (input ?? '').toLowerCase().replace(/;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  ejecutarConsultaSql(): void {
    if (!this.mision) return;
    this.etapaActual.set(4);

    const consultaLimpia = this.normalizarConsulta(this.codigoIngresado());
    const valida = this.mision.clavesValidacion.every((clave) =>
      consultaLimpia.includes(this.normalizarConsulta(clave)),
    );

    if (valida) {
      this.ejecucionExitosa.set(true);
      this.resultadoEjecucion.set(
        '¡Consulta ejecutada! El resultado coincide con lo esperado para la misión.',
      );
      this.filasResultado.set(this.mision.resultadoFilas);
    } else {
      this.ejecucionExitosa.set(false);
      this.resultadoEjecucion.set(this.mision.retroalimentacionError);
      this.filasResultado.set([]);
    }
  }

  continuarAlCuestionario(): void {
    this.missionCompleted.emit({
      retoId: this.idLeccion ?? this.mision?.numero ?? 0,
      xp: this.mision?.xpRecompensa ?? 0,
      prediccionCorrecta: this.prediccionCorrecta() === true,
      pistasUsadas: this.pistasSolicitadas(),
    });
  }
}
