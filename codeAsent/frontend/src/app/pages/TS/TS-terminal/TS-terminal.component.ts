import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ILabContext } from '../../../core/models/lab.model';
import { LabService } from '../../../core/services/lab.service';
import { IMission } from '../../../core/models/language.model';
import { MissionProgressService } from '../../../core/services/mission-progress.service';

@Component({
  selector: 'app-ts-terminal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './TS-terminal.component.html',
  styleUrl: './TS-terminal.component.scss'
})
export class TsTerminalComponent implements OnChanges {

  @Input()
  retoSeleccionado: IMission | null = null;

  @Output()
  back = new EventEmitter<void>();

  @Output()
  missionCompleted = new EventEmitter<void>();

  private readonly labService =
    inject(LabService);

  private readonly missionProgressService =
    inject(MissionProgressService);

  cargando = signal(true);

  errorCarga = signal<string | null>(null);

  lab = signal<ILabContext | null>(null);

  code = signal('');

  output = signal('');

  compiled = signal(false);

  error = signal(false);

  ejecutado = signal(false);

  prediccion = signal('');

  mostrarPrediccion = signal(false);

  feedback = signal('');

  mostrarFeedback = signal(false);

  finalizado = signal(false);

  pistasSolicitadas = signal(0);

  estrellasRestantes = signal(3);

  private readonly codigoInicial =
    '// Escribe aquí tu solución TypeScript\n\n';

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['retoSeleccionado'] &&
      this.retoSeleccionado?.id_leccion
    ) {

      this.cargarLaboratorio(
        this.retoSeleccionado.id_leccion
      );
    }
  }

  private cargarLaboratorio(
    missionId: number
  ): void {

    this.cargando.set(true);

    this.errorCarga.set(null);

    this.labService
      .getLabData(missionId)
      .subscribe({

        next: response => {

          /*
           * IMPORTANTE:
           * usamos directamente el objeto que devuelve
           * LabService.
           *
           * NO hacemos casts ni creamos un ILabContext
           * incompleto.
           */
          this.lab.set(response.data);

          this.resetearSesion();

          this.cargando.set(false);
        },

        error: error => {

          console.error(
            'Error al cargar el laboratorio TypeScript:',
            error
          );

          this.errorCarga.set(
            'No se pudo cargar el laboratorio TypeScript.'
          );

          this.lab.set(null);

          this.cargando.set(false);
        }
      });
  }

  private resetearSesion(): void {

    this.code.set(
      this.codigoInicial
    );

    this.output.set('');

    this.compiled.set(false);

    this.error.set(false);

    this.ejecutado.set(false);

    this.prediccion.set('');

    this.mostrarPrediccion.set(false);

    this.feedback.set('');

    this.mostrarFeedback.set(false);

    this.finalizado.set(false);

    this.pistasSolicitadas.set(0);

    this.estrellasRestantes.set(3);
  }

  obtenerTituloReto(): string {

    return (
      this.lab()?.titulo_leccion ??
      this.retoSeleccionado?.titulo ??
      'RETO TYPESCRIPT'
    );
  }

  obtenerProblema(): string {

    return (
      this.lab()?.contenido_leccion ??
      this.retoSeleccionado?.contenido ??
      'Resuelve el problema utilizando TypeScript.'
    );
  }

  obtenerConcepto(): string {

    return (
      this.lab()?.contenido_leccion ??
      ''
    );
  }

  solicitarPista(): void {

    const total =
      this.lab()?.pistas?.length ?? 0;

    if (
      total === 0 ||
      this.pistasSolicitadas() >= total
    ) {
      return;
    }

    this.pistasSolicitadas.update(
      valor => valor + 1
    );

    this.estrellasRestantes.update(
      valor => Math.max(0, valor - 1)
    );
  }

  obtenerPista(): string {

    const indice =
      this.pistasSolicitadas() - 1;

    if (indice < 0) {
      return '';
    }

    return (
      this.lab()?.pistas?.[indice]?.texto ??
      ''
    );
  }

  actualizarCodigo(codigo: string): void {

    this.code.set(codigo);

    this.error.set(false);

    this.mostrarFeedback.set(false);
  }

  prepararEjecucion(): void {

    if (!this.code().trim()) {

      this.output.set(
        '[TS-TERMINAL]\n\n' +
        'ERROR: El editor está vacío.\n\n' +
        'Escribe una solución antes de ejecutar.'
      );

      this.error.set(true);

      return;
    }

    this.mostrarPrediccion.set(true);

    this.output.set(
      '[TS-TERMINAL]\n\n' +
      'Antes de ejecutar tu programa, escribe una predicción y después pulsa EJECUTAR TS.'
    );
  }

  compile(): void {

    const codigo =
      this.code().trim();

    if (!codigo) {
      return;
    }

    try {

      const codigoEjecutable =
        codigo
          .replace(
            /interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g,
            ''
          )
          .replace(
            /:\s*(string|number|boolean|any|unknown|never|void)\b/g,
            ''
          )
          .replace(
            /\bas\s+(string|number|boolean|any|unknown)\b/g,
            ''
          );

      const resultados: string[] = [];

      const consoleOriginal =
        console.log;

      console.log = (
        ...args: unknown[]
      ) => {

        resultados.push(
          args
            .map(valor =>
              this.formatearResultado(valor)
            )
            .join(' ')
        );
      };

      try {

        new Function(
          codigoEjecutable
        )();

      } finally {

        console.log =
          consoleOriginal;
      }

      const salida =
        resultados.join('\n');

      this.output.set(
        `[TS-TERMINAL]\n\n` +
        `> COMPILANDO TYPESCRIPT...\n\n` +
        `COMPILACIÓN CORRECTA.\n\n` +
        `> EJECUTANDO main.ts...\n\n` +
        `--------------------------------\n\n` +
        `SALIDA DEL PROGRAMA\n\n` +
        `--------------------------------\n\n` +
        `${salida || 'El programa no produjo ninguna salida.'}\n\n` +
        `--------------------------------\n\n` +
        `> PROCESO FINALIZADO\n\n` +
        `--------------------------------`
      );

      this.compiled.set(true);

      this.error.set(false);

      this.ejecutado.set(true);

      this.generarFeedback(salida);

    } catch (error) {

      const mensaje =
        error instanceof Error
          ? error.message
          : String(error);

      this.output.set(
        `[TS-TERMINAL]\n\n` +
        `> COMPILANDO TYPESCRIPT...\n\n` +
        `ERROR\n\n` +
        `--------------------------------\n\n` +
        `${mensaje}\n\n` +
        `--------------------------------`
      );

      this.compiled.set(false);

      this.error.set(true);

      this.ejecutado.set(true);

      this.feedback.set(
        'El código no pudo ejecutarse. Revisa el mensaje y encuentra qué parte de tu solución provoca el error.'
      );

      this.mostrarFeedback.set(true);
    }
  }

  private generarFeedback(
    salida: string
  ): void {

    const prediccion =
      this.prediccion()
        .trim()
        .toLowerCase();

    const resultado =
      salida
        .trim()
        .toLowerCase();

    this.feedback.set(
      prediccion &&
      resultado.includes(prediccion)
        ? 'Tu predicción coincide con el resultado.'
        : 'Compara tu predicción con la salida y explica qué instrucción produjo el resultado.'
    );

    this.mostrarFeedback.set(true);
  }

  siguienteReto(): void {
    const missionId = this.retoSeleccionado?.id_leccion;
    if (!missionId) return;

    const prediction = this.prediccion().trim().toLowerCase();
    const output = this.output().toLowerCase();
    this.missionProgressService.updateTerminalStats(missionId, {
      prediccion_correcta: prediction.length > 0 && output.includes(prediction),
      pistas_usadas: this.pistasSolicitadas()
    }).subscribe({
      next: () => this.missionProgressService.updateProgress(missionId, 'quiz').subscribe({
        next: () => {
          this.finalizado.set(true);
          this.missionCompleted.emit();
        },
        error: error => console.error('No se pudo desbloquear el cuestionario:', error)
      }),
      error: error => console.error('No se pudieron guardar las estadísticas del terminal:', error)
    });
  }

  reset(): void {

    this.code.set(
      this.codigoInicial
    );

    this.output.set('');

    this.prediccion.set('');

    this.compiled.set(false);

    this.error.set(false);

    this.ejecutado.set(false);

    this.mostrarPrediccion.set(false);

    this.mostrarFeedback.set(false);
  }

  clear(): void {

    this.code.set('');

    this.output.set('');

    this.prediccion.set('');

    this.compiled.set(false);

    this.error.set(false);

    this.ejecutado.set(false);

    this.mostrarPrediccion.set(false);

    this.mostrarFeedback.set(false);
  }

  private formatearResultado(
    valor: unknown
  ): string {

    if (
      typeof valor === 'string'
    ) {
      return valor;
    }

    if (
      typeof valor === 'object'
    ) {
      return JSON.stringify(valor);
    }

    return String(valor);
  }
}