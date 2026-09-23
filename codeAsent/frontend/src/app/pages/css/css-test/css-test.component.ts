import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';

import { CssDataService, CssMision, CssQuizQuestion } from '../../../services/css-data.service';
import { RetoService } from '../../../services/ts-reto.service';
import { CssLocalProgressService } from '../../../core/services/css-local-progress.service';

@Component({
  selector: 'app-css-test',
  standalone: true,
  templateUrl: './css-test.component.html',
  styleUrl: './css-test.component.scss'
})
export class CssTestComponent implements OnInit, OnChanges {

  @Input() mission: CssMision | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();
  @Output() goToMissions = new EventEmitter<void>();
  saving = signal(false);
  savingAnswer = signal(false);

  private cssData = inject(CssDataService);
  private retoService = inject(RetoService);
  private localProgress = inject(CssLocalProgressService);

  preguntas = signal<CssQuizQuestion[]>([]);
  index = signal(0);
  selected = signal<number | null>(null);
  score = signal(0);
  finished = signal(false);
  xpGanado = signal(0);

  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarCuestionario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission'] && !changes['mission'].firstChange) {
      this.cargarCuestionario();
    }
  }

  private cargarCuestionario(): void {
    this.loading.set(true);
    this.error.set(null);
    this.finished.set(false);
    this.score.set(0);
    this.index.set(0);
    this.selected.set(null);
    this.xpGanado.set(0);
    this.savingAnswer.set(false);

    const idLeccion = this.mission?.leccion?.id_leccion;

        if (!idLeccion) {
          this.preguntas.set([]);
          this.loading.set(false);
          this.error.set('No se encontró una lección asociada a este nivel CSS.');
          return;
        }

        this.cssData.obtenerCuestionario(idLeccion).subscribe({
          next: (preguntas) => {
            this.preguntas.set((preguntas ?? []).slice(0, 3));
            this.loading.set(false);
            if (this.preguntas().length === 0) {
              this.error.set('No hay preguntas disponibles para esta misión CSS.');
            }
          },
          error: () => {
            this.loading.set(false);
            this.error.set('No se pudieron cargar las preguntas del cuestionario CSS.');
          }
        });
  }

  pregunta(): CssQuizQuestion | null {
    return this.preguntas()[this.index()] ?? null;
  }

  answer(i: number): void {
    const pregunta = this.pregunta();

    if (this.savingAnswer() || !pregunta || (this.selected() !== null && pregunta.respuestas[this.selected()!]?.es_correcta)) {
      return;
    }

    const respuesta = pregunta.respuestas[i];
    this.selected.set(i);

    if (respuesta?.es_correcta) {
      this.score.update((puntos) => puntos + 1);
    }

    this.savingAnswer.set(true);
    this.retoService.registrarIntentoConXp({
      id_reto: pregunta.id_reto,
      respuesta_usuario: respuesta?.texto_respuesta ?? null,
      correcto: Boolean(respuesta?.es_correcta)
    }).subscribe((xp) => {
      this.savingAnswer.set(false);
      this.xpGanado.update((valor) => valor + xp);
    }, () => {
      this.savingAnswer.set(false);
      this.selected.set(null);
      this.error.set('No se pudo guardar la respuesta. Inténtalo nuevamente.');
    });
  }

  next(): void {
    if (this.saving() || this.savingAnswer() || !this.pregunta() || !this.pregunta()!.respuestas[this.selected()!]?.es_correcta) return;
    if (this.index() < this.preguntas().length - 1) {
      this.index.update((i) => i + 1);
      this.selected.set(null);
    } else {
      const idLeccion = this.mission?.leccion?.id_leccion;
      if (idLeccion) {
        this.error.set(null);
        this.saving.set(true);
        this.cssData.completarCuestionario(idLeccion).subscribe({
          next: resultado => {
            this.saving.set(false);

            if (!resultado.completada) {
              this.error.set('La misión todavía no está completa. Responde correctamente todas las preguntas.');
              return;
            }

            this.finished.set(true);
            this.localProgress.completeMission(
              this.mission?.nivel.id_nivel ?? 0,
              resultado.xp_mision || 100,
              (this.mission?.nivel.numero_nivel ?? 0) + 1
            );
            this.completed.emit();
          },
          error: () => {
            this.saving.set(false);
            this.error.set("No se pudo guardar el cuestionario. Intenta nuevamente.");
          }
        });
      } else {
        this.error.set("No se encontró la lección para guardar el progreso.");
      }
    }
  }

  restart(): void {
    this.index.set(0);
    this.selected.set(null);
    this.score.set(0);
    this.finished.set(false);
    this.xpGanado.set(0);
    this.cargarCuestionario();
  }
}
