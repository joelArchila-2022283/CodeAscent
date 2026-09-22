import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';

import { LanguageService } from '../../../core/services/language.service';
import { IMission } from '../../../core/models/language.model';

interface MissionView {
  id: number;
  code: string;
  title: string;
  detail: string;
  reward: string;
  mission: IMission;
}

@Component({
  selector: 'app-ts-processes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-processes.component.html',
  styleUrl: './TS-processes.component.scss'
})
export class TSProcessesComponent implements OnInit {

  @Output()
  back = new EventEmitter<void>();

  @Output()
  missionSelected = new EventEmitter<IMission>();

  private readonly languageService = inject(LanguageService);

  cargando = signal(true);

  errorCarga = signal<string | null>(null);

  missions = signal<MissionView[]>([]);

  ngOnInit(): void {
    this.cargarMisiones();
  }

  cargarMisiones(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.languageService.obtenerMisionesPorSlug('typescript').subscribe({
      next: response => {
        this.missions.set(
          (response.data ?? []).map((mission, index) => ({
            id: mission.id_leccion,
            code: `TS-${String(index + 1).padStart(2, '0')}`,
            title: mission.titulo,
            detail:
              mission.contenido ||
              'Completa esta misión de TypeScript.',
            reward: `MISIÓN ${index + 1}`,
            mission
          }))
        );

        this.cargando.set(false);
      },

      error: error => {
        console.error(
          'Error al cargar las misiones TypeScript:',
          error
        );

        this.errorCarga.set(
          'No se pudieron cargar las misiones TypeScript.'
        );

        this.cargando.set(false);
      }
    });
  }

  seleccionarMision(mission: MissionView): void {
    if (
      mission.mission.estado === 'locked' ||
      mission.mission.estado === 'completed'
    ) {
      return;
    }

    this.missionSelected.emit(mission.mission);
  }
}