import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CssDataService, CssMision } from '../../../services/css-data.service';
import { NivelCss, RetoCss } from '../../../interfaces/css.interface';

@Component({
  selector: 'app-css-processes',
  standalone: true,
  templateUrl: './css-processes.component.html',
  styleUrl: './css-processes.component.scss'
})
export class CssProcessesComponent implements OnInit {

  @Output() back = new EventEmitter<void>();
  @Output() missionSelected = new EventEmitter<CssMision>();

  private cssData = inject(CssDataService);

  levels: NivelCss[] = [];
  misiones: CssMision[] = [];

  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMisiones();
  }

  private cargarMisiones(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cssData.obtenerMisionesCss().subscribe({
      next: (misiones: CssMision[]) => {
        this.misiones = misiones ?? [];
        this.levels = this.misiones.map((mision) => mision.nivel);
        this.loading.set(false);

        if (this.levels.length === 0) {
          this.error.set('PostgreSQL no devolvió misiones CSS.');
          return;
        }
      },
      error: (error) => {
        console.error('PROCESSES - Error cargando CSS:', error);
        this.loading.set(false);
        this.error.set('No se pudieron cargar las misiones CSS.');
      }
    });
  }

  codigo(level: NivelCss): RetoCss | undefined {
    return level.retos?.find((reto: RetoCss) => reto.tipo_reto === 'codigo');
  }

  xpMision(level: NivelCss): number {
    return level.numero_nivel * 100;
  }

  misionPorNivel(level: NivelCss): CssMision | undefined {
    return this.misiones.find((mision) => mision.nivel.id_nivel === level.id_nivel);
  }

  iniciarMision(level: NivelCss): void {
    const mision = this.misionPorNivel(level);
    if (!mision?.desbloqueada) {
      return;
    }
    this.missionSelected.emit(mision);
  }
}
