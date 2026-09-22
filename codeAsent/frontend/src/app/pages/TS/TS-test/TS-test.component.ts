import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { catchError, map, of } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { IMission } from '../../../core/models/language.model';

import { MissionProgressService } from '../../../core/services/mission-progress.service';

interface TSQuizAnswer {
  id_respuesta: number;
  texto_respuesta: string;
  es_correcta: boolean;
}

interface TSQuizQuestion {
  id_reto: number;
  enunciado: string;
  xp_recompensa?: number;
  respuestas: TSQuizAnswer[];
}

@Component({
  selector: 'app-ts-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-test.component.html',
  styleUrl: './TS-test.component.scss'
})
export class TSTestComponent
  implements OnChanges {

  @Input()
  mission: IMission | null = null;

  @Output()
  back = new EventEmitter<void>();

  @Output()
  next = new EventEmitter<void>();

  @Output()
  quizCompleted =
    new EventEmitter<void>();

  private readonly http =
    inject(HttpClient);

  private readonly missionProgressService =
    inject(MissionProgressService);

  private readonly apiUrl =
    environment.apiUrl;

  preguntas =
    signal<TSQuizQuestion[]>([]);

  preguntaActual =
    signal(0);

  seleccionada =
    signal<number | null>(null);

  respondida =
    signal(false);

  esCorrecta =
    signal(false);

  cargando =
    signal(false);

  finalizado =
    signal(false);

  xpGanado =
    signal(0);

  errorCarga =
    signal<string | null>(null);

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['mission'] &&
      this.mission?.id_leccion
    ) {

      this.cargarCuestionario(
        this.mission.id_leccion
      );
    }
  }

  private cargarCuestionario(
    idLeccion: number
  ): void {

    this.cargando.set(true);

    this.errorCarga.set(null);

    this.finalizado.set(false);

    this.preguntaActual.set(0);

    this.seleccionada.set(null);

    this.respondida.set(false);

    this.esCorrecta.set(false);

    this.xpGanado.set(0);

    this.http
      .get<{ data: TSQuizQuestion[] }>(
        `${this.apiUrl}/missions/${idLeccion}/quiz`
      )
      .pipe(

        map(response =>
          (response?.data ?? []).slice(0, 3)
        ),

        catchError(error => {

          console.error(
            'Error al cargar el cuestionario TypeScript:',
            error
          );

          this.errorCarga.set(
            'No se pudieron cargar los cuestionarios.'
          );

          return of([]);
        })
      )
      .subscribe(preguntas => {

        this.preguntas.set(
          preguntas.map(pregunta => ({
            ...pregunta,

            respuestas: this.barajar(
              (pregunta.respuestas ?? []).map(respuesta => ({
                ...respuesta,
                es_correcta:
                  respuesta.es_correcta === true ||
                  String(respuesta.es_correcta).toLowerCase() === 'true'
              }))
            )
          }))
        );

        this.cargando.set(false);
      });
  }

  private barajar<T>(elementos: T[]): T[] {
    const resultado = [...elementos];
    for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
      const aleatorio = Math.floor(Math.random() * (indice + 1));
      [resultado[indice], resultado[aleatorio]] = [resultado[aleatorio], resultado[indice]];
    }
    return resultado;
  }

  pregunta():
    TSQuizQuestion | null {

    return (
      this.preguntas()[
        this.preguntaActual()
      ] ?? null
    );
  }

  responder(
    indice: number,
    correcta: boolean
  ): void {

    if (
      this.respondida() ||
      !this.pregunta()
    ) {
      return;
    }

    this.seleccionada.set(indice);

    this.esCorrecta.set(correcta);

    this.respondida.set(true);

  }

  reintentar(): void {

    this.seleccionada.set(null);

    this.respondida.set(false);

    this.esCorrecta.set(false);
  }

  siguiente(): void {

    if (
      !this.respondida() ||
      !this.esCorrecta()
    ) {
      return;
    }

    if (
      this.preguntaActual() >=
      this.preguntas().length - 1
    ) {

      if (!this.mission?.id_leccion) return;

      this.missionProgressService.completeMission(
        this.mission.id_leccion,
        this.preguntas().length,
        this.preguntas().length
      ).subscribe({
        next: response => {
          this.xpGanado.set(Number(response?.data?.xp_awarded ?? 0));
          this.finalizado.set(true);
        },
        error: error => console.error('Error al completar la misión TypeScript:', error)
      });

      return;
    }

    this.preguntaActual.update(
      indice => indice + 1
    );

    this.seleccionada.set(null);

    this.respondida.set(false);

    this.esCorrecta.set(false);
  }
}