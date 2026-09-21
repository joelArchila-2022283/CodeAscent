import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CssDataService } from '../../../services/css-data.service';
import { NivelCss, RetoCss } from '../../../interfaces/css.interface';

@Component({
  selector: 'app-css-test',
  standalone: true,
  templateUrl: './css-test.component.html',
  styleUrl: './css-test.component.scss'
})
export class CssTestComponent implements OnInit {

  @Output() back = new EventEmitter<void>();

  private cssData = inject(CssDataService);

  levels: NivelCss[] = [];

  index = signal(0);
  selected = signal<number | null>(null);
  score = signal(0);
  finished = signal(false);

  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cssData.obtenerNivelesPedagogicos().subscribe({
      next: (niveles: NivelCss[]) => {
        console.log('TEST - Niveles recibidos:', niveles);

        this.levels = (niveles ?? []).filter(
          (nivel) => this.quiz(nivel) !== null
        );

        this.loading.set(false);

        if (this.levels.length === 0) {
          this.error.set(
            'No se encontraron cuestionarios CSS en los niveles recibidos.'
          );
        }
      },
      error: (err) => {
        console.error('TEST - Error al cargar cuestionarios:', err);
        this.loading.set(false);
        this.error.set(
          'No se pudieron cargar los cuestionarios CSS.'
        );
      }
    });
  }

  current(): NivelCss | null {
    return this.levels[this.index()] ?? null;
  }

  quiz(level: NivelCss | null = this.current()): RetoCss | null {
    return level?.retos?.find(
      (reto) => reto.tipo_reto === 'opcion_multiple'
    ) ?? null;
  }

  answer(i: number): void {
    const pregunta = this.quiz();

    if (!pregunta || this.selected() !== null) {
      return;
    }

    this.selected.set(i);

    if (pregunta.respuestas?.[i]?.es_correcta) {
      this.score.update((puntos) => puntos + 1);
    }
  }

  next(): void {
    if (this.index() < this.levels.length - 1) {
      this.index.update((i) => i + 1);
      this.selected.set(null);
    } else {
      this.finished.set(true);
    }
  }

  restart(): void {
    this.index.set(0);
    this.selected.set(null);
    this.score.set(0);
    this.finished.set(false);
  }
}