import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';

import { TsDataService } from '../../../services/ts-data.service';
import { RetoService } from '../../../services/ts-reto.service';

import { IReto } from '../../../interfaces/reto.interface';

interface MissionView {
  id: number;
  code: string;
  title: string;
  detail: string;
  reward: string;
  icon: string;
  reto: IReto;
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
  missionSelected = new EventEmitter<IReto>();

  private tsDataService = inject(TsDataService);
  private retoService = inject(RetoService);

  cargando = signal<boolean>(true);

  errorCarga = signal<string | null>(null);

  missions = signal<MissionView[]>([]);

  completed = signal<number[]>([]);

  ngOnInit(): void {
    this.cargarMisiones();
  }

  cargarMisiones(): void {

    this.cargando.set(true);
    this.errorCarga.set(null);

    this.tsDataService
      .obtenerTodasLasLecciones()
      .subscribe({

        next: grupos => {

          const idsLeccion = grupos
            .flatMap(grupo => grupo.lecciones)
            .map(leccion => leccion.id_leccion)
            .filter(
              (id): id is number =>
                id !== undefined &&
                id !== null
            );

          if (idsLeccion.length === 0) {

            this.missions.set([]);
            this.cargando.set(false);

            return;
          }

          this.retoService
            .obtenerRetosDeLecciones(idsLeccion)
            .subscribe({

              next: retos => {

                const misiones = retos
                  .sort(
                    (a, b) =>
                      (a.id_reto ?? 0) -
                      (b.id_reto ?? 0)
                  );

                this.missions.set(
                  misiones.map(
                    (reto, index) => ({

                      id: reto.id_reto!,

                      code:
                        `TS-${String(index + 1).padStart(2, '0')}`,

                      title:
                        reto.titulo,

                      detail:
                        reto.descripcion ||
                        'Completa esta misión de TypeScript.',

                      reward:
                        `+${reto.xp_recompensa ?? 0} XP`,

                      icon:
                        'bi-cpu',

                      reto: reto

                    })
                  )
                );

                this.cargarCompletadas();

                this.cargando.set(false);
              },

              error: err => {

                console.error(
                  'Error al cargar los retos:',
                  err
                );

                this.errorCarga.set(
                  'No se pudieron cargar las misiones TypeScript.'
                );

                this.cargando.set(false);
              }
            });
        },

        error: err => {

          console.error(
            'Error al cargar las lecciones:',
            err
          );

          this.errorCarga.set(
            'No se pudieron cargar las misiones TypeScript.'
          );

          this.cargando.set(false);
        }
      });
  }

  private cargarCompletadas(): void {

    this.retoService
      .obtenerRetosCompletados()
      .subscribe({

        next: ids => {

          this.completed.set(
            Array.from(ids)
          );
        },

        error: err => {

          console.error(
            'Error al cargar misiones completadas:',
            err
          );
        }
      });
  }

  seleccionarMision(
    mission: MissionView
  ): void {

    if (
      this.completed()
        .includes(mission.id)
    ) {
      return;
    }

    this.missionSelected.emit(
      mission.reto
    );
  }
}