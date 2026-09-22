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

  private cssData = inject(CssDataService);
  private retoService = inject(RetoService);

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

    if (!pregunta || (this.selected() !== null && pregunta.respuestas[this.selected()!]?.es_correcta)) {
      return;
    }

    const respuesta = pregunta.respuestas[i];
    this.selected.set(i);

    if (respuesta?.es_correcta) {
      this.score.update((puntos) => puntos + 1);
    }

    this.retoService.registrarIntentoConXp({
      id_reto: pregunta.id_reto,
      respuesta_usuario: respuesta?.texto_respuesta ?? null,
      correcto: Boolean(respuesta?.es_correcta)
    }).subscribe((xp) => {
      this.xpGanado.update((valor) => valor + xp);
    });
  }

  next(): void {
    if (!this.pregunta() || !this.pregunta()!.respuestas[this.selected()!]?.es_correcta) return;
    if (this.index() < this.preguntas().length - 1) {
      this.index.update((i) => i + 1);
      this.selected.set(null);
    } else {
      const idLeccion = this.mission?.leccion?.id_leccion;
      if (idLeccion) {
        this.cssData.completarCuestionario(idLeccion).subscribe({
          next: () => { this.finished.set(true); this.completed.emit(); },
          error: () => this.finished.set(true)
        });
      } else {
        this.finished.set(true);
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
