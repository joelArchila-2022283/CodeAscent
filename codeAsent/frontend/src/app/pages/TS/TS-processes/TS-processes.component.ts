import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';

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
}

const ICONOS_POR_TIPO: Record<string, string> = {
  opcion_multiple: 'bi-patch-question',
  codigo: 'bi-code-slash',
  verdadero_falso: 'bi-toggle2-on',
  completar: 'bi-input-cursor-text'
};

@Component({
  selector: 'app-ts-processes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-processes.component.html',
  styleUrl: './TS-processes.component.scss'
})
export class TSProcessesComponent implements OnInit {

  @Output() back = new EventEmitter<void>();

  private tsDataService = inject(TsDataService);
  private retoService = inject(RetoService);

  cargando = signal<boolean>(true);
  errorCarga = signal<string | null>(null);

  missions = signal<MissionView[]>([]);
  completed = signal<number[]>([]);

  private retosPorId = new Map<number, IReto>();

  ngOnInit(): void {
    this.cargarMisiones();
  }

  cargarMisiones(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.tsDataService.obtenerLeccionesNivelActual().subscribe({
      next: ({ lecciones }) => {
        const idsLeccion = lecciones
          .map(l => l.id_leccion)
          .filter((id): id is number => !!id);

        this.retoService.obtenerRetosDeLecciones(idsLeccion).subscribe({
          next: (retos) => {
            this.retosPorId = new Map(
              retos.filter(r => r.id_reto).map(r => [r.id_reto as number, r])
            );

            this.missions.set(
              retos
                .filter(r => r.id_reto)
                .map((reto, index) => ({
                  id: reto.id_reto as number,
                  code: `TS-${String(index + 1).padStart(2, '0')}`,
                  title: reto.titulo,
                  detail: reto.descripcion,
                  reward: `+${reto.xp_recompensa ?? 0} XP`,
                  icon: ICONOS_POR_TIPO[reto.tipo_reto] || 'bi-cpu'
                }))
            );

            this.retoService.obtenerRetosCompletados().subscribe({
              next: (completados) => {
                this.completed.set(
                  retos
                    .filter(r => r.id_reto && completados.has(r.id_reto))
                    .map(r => r.id_reto as number)
                );
                this.cargando.set(false);
              },
              error: () => {
                this.cargando.set(false);
              }
            });
          },
          error: (err) => {
            console.error('Error al cargar los retos TypeScript:', err);
            this.errorCarga.set('No se pudieron cargar los procesos TypeScript.');
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar el nivel actual:', err);
        this.errorCarga.set('No se pudieron cargar los procesos TypeScript.');
        this.cargando.set(false);
      }
    });
  }

  toggleMission(id: number): void {
    if (this.completed().includes(id)) {
      // Un intento ya registrado no puede deshacerse desde aquí:
      // no existe una operación para que el usuario elimine su propio intento.
      return;
    }

    const reto = this.retosPorId.get(id);

    this.retoService
      .registrarIntento({
        id_reto: id,
        correcto: true,
        xp_obtenida: reto?.xp_recompensa ?? 0
      })
      .subscribe(exito => {
        if (exito) {
          this.completed.update(items => [...items, id]);
        }
      });
  }
}