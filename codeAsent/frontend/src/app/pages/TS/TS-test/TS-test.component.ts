import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';

import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { TsDataService } from '../../../services/ts-data.service';
import { RetoService } from '../../../services/ts-reto.service';
import { IReto } from '../../../interfaces/reto.interface';

interface PreguntaTS {
  reto: IReto;
  opciones: string[];
  correctIndex: number;
}

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

  cargando = signal(true);
  errorCarga = signal<string | null>(null);

  preguntas = signal<PreguntaTS[]>([]);
  preguntaActual = signal(0);

  selected = signal<number | null>(null);
  answered = signal(false);

  question = signal('');
  options = signal<string[]>([]);
  correctIndex = signal(0);
  totalPreguntas = signal(0);
  xpRecompensa = signal(0);

  private retoActual: IReto | null = null;

  ngOnInit(): void {
    this.cargarPreguntas();
  }

  cargarPreguntas(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.tsDataService.obtenerTodasLasLecciones().subscribe({
      next: (grupos) => {

        const idsLeccion = grupos
          .flatMap(grupo => grupo.lecciones)
          .map(leccion => leccion.id_leccion)
          .filter((id): id is number => !!id);

        if (idsLeccion.length === 0) {
          this.preguntas.set([]);
          this.totalPreguntas.set(0);
          this.cargando.set(false);
          return;
        }

        this.retoService
          .obtenerRetosDeLecciones(idsLeccion)
          .subscribe({
            next: (retos) => {

              const cuestionarios = retos.filter(
                reto => reto.tipo_reto === 'opcion_multiple'
              );

              if (cuestionarios.length === 0) {
                this.preguntas.set([]);
                this.totalPreguntas.set(0);
                this.cargando.set(false);
                return;
              }

              const peticiones = cuestionarios.map(reto =>
                this.retoService
                  .obtenerRespuestasDeReto(reto.id_reto!)
                  .pipe(
                    map(respuestas => {

                      const correctIndex =
                        respuestas.findIndex(
                          respuesta => respuesta.es_correcta
                        );

                      return {
                        reto,
                        opciones: respuestas.map(
                          respuesta => respuesta.contenido
                        ),
                        correctIndex:
                          correctIndex >= 0
                            ? correctIndex
                            : 0
                      };
                    })
                  )
              );

              forkJoin(peticiones).subscribe({
                next: (preguntas) => {

                  this.preguntas.set(preguntas);
                  this.totalPreguntas.set(preguntas.length);

                  this.mostrarPregunta(0);

                  this.cargando.set(false);
                },

                error: (err) => {

                  console.error(
                    'Error al cargar las respuestas:',
                    err
                  );

                  this.errorCarga.set(
                    'No se pudieron cargar los cuestionarios.'
                  );

                  this.cargando.set(false);
                }
              });
            },

            error: (err) => {

              console.error(
                'Error al cargar los cuestionarios:',
                err
              );

              this.errorCarga.set(
                'No se pudieron cargar los cuestionarios.'
              );

              this.cargando.set(false);
            }
          });
      },

      error: (err) => {

        console.error(
          'Error al cargar las lecciones:',
          err
        );

        this.errorCarga.set(
          'No se pudieron cargar los cuestionarios.'
        );

        this.cargando.set(false);
      }
    });
  }

  mostrarPregunta(index: number): void {

    const preguntas = this.preguntas();

    if (!preguntas[index]) {
      return;
    }

    const pregunta = preguntas[index];

    this.preguntaActual.set(index);

    this.retoActual = pregunta.reto;

    this.question.set(
      pregunta.reto.descripcion ||
      pregunta.reto.titulo
    );

    this.options.set(
      pregunta.opciones
    );

    this.correctIndex.set(
      pregunta.correctIndex
    );

    this.xpRecompensa.set(
      pregunta.reto.xp_recompensa ?? 0
    );

    this.selected.set(null);
    this.answered.set(false);
  }

  siguientePregunta(): void {

    if (!this.answered()) {
      return;
    }

    const siguiente =
      this.preguntaActual() + 1;

    if (
      siguiente >=
      this.preguntas().length
    ) {
      return;
    }

    this.mostrarPregunta(siguiente);
  }

  choose(index: number): void {

    /*
     * Si ya respondió correctamente,
     * no permitimos volver a seleccionar.
     */
    if (
      this.answered() &&
      this.selected() === this.correctIndex()
    ) {
      return;
    }

    this.selected.set(index);

    const esCorrecta =
      index === this.correctIndex();

    /*
     * answered solamente se activa
     * cuando la respuesta es correcta.
     *
     * Si falla:
     * - puede volver a intentar
     * - no puede pasar a la siguiente pregunta
     */
    this.answered.set(esCorrecta);

    if (!this.retoActual?.id_reto) {
      return;
    }

    this.retoService
      .registrarIntento({
        id_reto: this.retoActual.id_reto,
        respuesta_usuario: this.options()[index] ?? null,
        correcto: esCorrecta,
        xp_obtenida: 0
      })
      .subscribe({
        error: (err) => {
          console.error(
            'Error al registrar intento:',
            err
          );
        }
      });
  }
}