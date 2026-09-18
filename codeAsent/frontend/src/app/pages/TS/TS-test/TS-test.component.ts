import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';

import { TsDataService } from '../../../services/ts-data.service';
import { RetoService } from '../../../services/ts-reto.service';
import { IReto } from '../../../interfaces/reto.interface';

@Component({
  selector: 'app-ts-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-test.component.html',
  styleUrl: './TS-test.component.scss'
})
export class TSTestComponent implements OnInit {

  @Output() back = new EventEmitter<void>();

  private tsDataService = inject(TsDataService);
  private retoService = inject(RetoService);

  cargando = signal<boolean>(true);
  errorCarga = signal<string | null>(null);

  selected = signal<number | null>(null);
  answered = signal(false);

  question = signal<string>('');
  options = signal<string[]>([]);
  correctIndex = signal<number>(0);
  totalPreguntas = signal<number>(0);
  xpRecompensa = signal<number>(0);

  private retoActual: IReto | null = null;

  ngOnInit(): void {
    this.cargarPregunta();
  }

  cargarPregunta(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.tsDataService.obtenerLeccionesNivelActual().subscribe({
      next: ({ lecciones }) => {
        const idsLeccion = lecciones
          .map(l => l.id_leccion)
          .filter((id): id is number => !!id);

        this.retoService.obtenerRetosDeLecciones(idsLeccion).subscribe({
          next: (retos) => {
            const opcionMultiple = retos.filter(r => r.tipo_reto === 'opcion_multiple');
            this.totalPreguntas.set(opcionMultiple.length);

            const reto = opcionMultiple[0] ?? null;
            this.retoActual = reto;

            if (!reto || !reto.id_reto) {
              this.cargando.set(false);
              return;
            }

            this.question.set(reto.descripcion || reto.titulo);
            this.xpRecompensa.set(reto.xp_recompensa ?? 0);

            this.retoService.obtenerRespuestasDeReto(reto.id_reto).subscribe({
              next: (respuestas) => {
                this.options.set(respuestas.map(r => r.contenido));
                const indiceCorrecto = respuestas.findIndex(r => r.es_correcta);
                this.correctIndex.set(indiceCorrecto >= 0 ? indiceCorrecto : 0);
                this.cargando.set(false);
              },
              error: (err) => {
                console.error('Error al cargar las respuestas del reto:', err);
                this.errorCarga.set('No se pudo cargar la prueba de TypeScript.');
                this.cargando.set(false);
              }
            });
          },
          error: (err) => {
            console.error('Error al cargar los retos TypeScript:', err);
            this.errorCarga.set('No se pudo cargar la prueba de TypeScript.');
            this.cargando.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar el nivel actual:', err);
        this.errorCarga.set('No se pudo cargar la prueba de TypeScript.');
        this.cargando.set(false);
      }
    });
  }

  choose(index: number): void {
    if (this.answered()) {
      return;
    }

    this.selected.set(index);
    this.answered.set(true);

    if (!this.retoActual?.id_reto) {
      return;
    }

    const esCorrecta = index === this.correctIndex();

    this.retoService
      .registrarIntento({
        id_reto: this.retoActual.id_reto,
        respuesta_usuario: this.options()[index] ?? null,
        correcto: esCorrecta,
        xp_obtenida: esCorrecta ? this.xpRecompensa() : 0
      })
      .subscribe();
  }
}