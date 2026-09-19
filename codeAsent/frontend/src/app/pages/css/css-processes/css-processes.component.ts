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
  selector: 'app-css-processes',
  standalone: true,
  templateUrl: './css-processes.component.html',
  styleUrl: './css-processes.component.scss'
})
export class CssProcessesComponent implements OnInit {

  @Output() back = new EventEmitter<void>();
  @Output() openTerminal = new EventEmitter<number>();

  private cssData = inject(CssDataService);

  levels: NivelCss[] = [];

  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMisiones();
  }

  private cargarMisiones(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cssData.obtenerNivelesPedagogicos().subscribe({
      next: (levels: NivelCss[]) => {

        console.log(
          'PROCESSES - Niveles recibidos:',
          levels
        );

        this.levels = levels ?? [];

        this.loading.set(false);

        if (this.levels.length === 0) {
          this.error.set(
            'PostgreSQL no devolvió misiones CSS.'
          );

          return;
        }

        console.log(
          `PROCESSES - ${this.levels.length} niveles cargados`
        );
      },

      error: (error) => {

        console.error(
          'PROCESSES - Error cargando CSS:',
          error
        );

        this.loading.set(false);

        this.error.set(
          'No se pudieron cargar las misiones CSS.'
        );
      }
    });
  }

  codigo(level: NivelCss): RetoCss | undefined {
    return level.retos?.find(
      (reto: RetoCss) => reto.tipo_reto === 'codigo'
    );
  }

  iniciarMision(level: NivelCss): void {
    this.openTerminal.emit(level.numero_nivel);
  }
}