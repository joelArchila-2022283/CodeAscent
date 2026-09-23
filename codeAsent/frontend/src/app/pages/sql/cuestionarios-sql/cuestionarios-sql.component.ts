import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisionSqlConfig } from '../misiones-sql.data';

export interface ResultadoCuestionarioSql {
  missionId: number;
  correct: number;
  total: number;
  xp: number;
}

@Component({
  selector: 'app-cuestionarios-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuestionarios-sql.component.html',
  styleUrls: ['./cuestionarios-sql.component.scss'],
})
export class CuestionariosSqlComponent implements OnChanges {
  @Input() mision: MisionSqlConfig | null = null;
  @Input() idLeccion: number | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() quizCompleted = new EventEmitter<ResultadoCuestionarioSql>();

  indicePreguntaActual = signal<number>(0);
  opcionSeleccionada = signal<number | null>(null);
  respuestaVerificada = signal<boolean>(false);
  puntuacion = signal<number>(0);
  quizFinalizado = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['mision']) return;
    this.indicePreguntaActual.set(0);
    this.opcionSeleccionada.set(null);
    this.respuestaVerificada.set(false);
    this.puntuacion.set(0);
    this.quizFinalizado.set(false);
  }

  seleccionarRespuesta(indice: number): void {
    if (!this.respuestaVerificada() && this.mision) {
      this.opcionSeleccionada.set(indice);
    }
  }

  verificarRespuesta(): void {
    if (!this.mision || this.opcionSeleccionada() === null) return;
    this.respuestaVerificada.set(true);

    if (this.opcionSeleccionada() === this.preguntaActual().indiceCorrecto) {
      this.puntuacion.update((p) => p + 1);
    }
  }

  reintentar(): void {
    this.respuestaVerificada.set(false);
    this.opcionSeleccionada.set(null);
  }

  siguientePregunta(): void {
    if (!this.mision) return;
    if (this.indicePreguntaActual() < this.mision.preguntasDiagnostico.length - 1) {
      this.indicePreguntaActual.update((i) => i + 1);
      this.opcionSeleccionada.set(null);
      this.respuestaVerificada.set(false);
    } else {
      this.finalizarQuiz();
    }
  }

  finalizarQuiz(): void {
    if (!this.mision) return;
    this.quizFinalizado.set(true);
    const total = this.mision.preguntasDiagnostico.length;
    this.quizCompleted.emit({
      missionId: this.idLeccion ?? this.mision.numero,
      correct: this.puntuacion(),
      total,
      xp: this.mision.xpRecompensa,
    });
  }

  preguntaActual() {
    const lista = this.mision?.preguntasDiagnostico ?? [];
    return lista[Math.min(this.indicePreguntaActual(), lista.length - 1)];
  }
}
