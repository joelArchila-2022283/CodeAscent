import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { HtmlDataService, HtmlQuizQuestion } from '../../../services/html-data.service';
import { RetoService } from '../../../services/ts-reto.service';
import { MissionProgressService } from '../../../core/services/mission-progress.service';

@Component({
  selector: 'app-ts-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-test.component.html',
  styleUrl: './TS-test.component.scss'
})
export class TSTestComponent implements OnChanges {
  @Input() mission: any = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() xpAwarded = new EventEmitter<number>();

  private readonly htmlDataService = inject(HtmlDataService);
  private readonly retoService = inject(RetoService);
  private readonly missionProgressService = inject(MissionProgressService);

  preguntas = signal<HtmlQuizQuestion[]>([]);
  preguntaActual = signal(0);
  seleccionada = signal<number | null>(null);
  respondida = signal(false);
  esCorrecta = signal(false);
  cargando = signal(false);
  finalizado = signal(false);
  xpGanado = signal(0);
  errorCarga = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission'] && this.mission?.id_leccion) {
      this.missionProgressService.updateProgress(this.mission.id_leccion, 'quiz').subscribe({
        error: () => undefined
      });
      this.cargarCuestionario(this.mission.id_leccion);
    }
  }

  private cargarCuestionario(idLeccion: number): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.finalizado.set(false);
    this.preguntaActual.set(0);
    this.seleccionada.set(null);
    this.respondida.set(false);
    this.xpGanado.set(0);
    this.htmlDataService.obtenerCuestionario(idLeccion).subscribe({
      next: preguntas => {
        this.preguntas.set(preguntas.slice(0, 3));
        this.cargando.set(false);
      },
      error: error => {
        console.error(error);
        this.errorCarga.set('No se pudieron cargar los cuestionarios.');
        this.cargando.set(false);
      }
    });
  }

  pregunta(): HtmlQuizQuestion | null {
    return this.preguntas()[this.preguntaActual()] ?? null;
  }

  responder(indice: number, correcta: boolean): void {
    if (this.respondida() || !this.pregunta()) return;

    this.seleccionada.set(indice);
    this.esCorrecta.set(correcta);
    this.respondida.set(true);

    if (!correcta) return;

    const actual = this.pregunta()!;
    this.retoService.registrarIntentoConXp({
      id_reto: actual.id_reto,
      respuesta_usuario: actual.respuestas[indice]?.texto_respuesta,
      correcto: true
    }).subscribe(xp => {
      this.xpGanado.update(total => total + xp);
      if (xp > 0) this.xpAwarded.emit(xp);
    });
  }

  reintentar(): void {
    this.seleccionada.set(null);
    this.respondida.set(false);
    this.esCorrecta.set(false);
  }

  private marcarMisionCompletada(): void {
    const idLeccion = this.mission?.id_leccion;
    const total = this.preguntas().length;
    if (!idLeccion || total === 0) return;
    this.missionProgressService.completeMission(idLeccion, total, total, 'quiz').subscribe({
      error: () => undefined
    });
  }

  siguiente(): void {
    if (!this.respondida() || !this.esCorrecta()) return;
    if (this.preguntaActual() >= this.preguntas().length - 1) {
      this.finalizado.set(true);
      this.marcarMisionCompletada();
      return;
    }
    this.preguntaActual.update(indice => indice + 1);
    this.seleccionada.set(null);
    this.respondida.set(false);
    this.esCorrecta.set(false);
  }
}
