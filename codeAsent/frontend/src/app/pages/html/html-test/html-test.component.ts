import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { HtmlDataService, HtmlQuizQuestion } from '../../../services/html-data.service';
import { MissionProgressService } from '../../../core/services/mission-progress.service';

@Component({
  selector: 'app-html-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './html-test.component.html',
  styleUrl: './html-test.component.scss'
})
export class HtmlTestComponent implements OnChanges {
  @Input() retoPrediccion: any = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() xpAwarded = new EventEmitter<number>();

  private readonly htmlDataService = inject(HtmlDataService);
  private readonly missionProgressService = inject(MissionProgressService);

  preguntas = signal<HtmlQuizQuestion[]>([]);
  preguntaActual = signal(0);
  seleccionada = signal<number | null>(null);
  respondida = signal(false);
  esCorrecta = signal(false);
  cargando = signal(false);
  finalizado = signal(false);
  xpGanado = signal(0);
  mensajeError = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['retoPrediccion'] && this.retoPrediccion?.id_leccion) {
      this.cargarCuestionario(this.retoPrediccion.id_leccion);
    }
  }

  private cargarCuestionario(idLeccion: number): void {
    this.cargando.set(true);
    this.finalizado.set(false);
    this.preguntaActual.set(0);
    this.seleccionada.set(null);
    this.respondida.set(false);
    this.xpGanado.set(0);
    this.mensajeError.set(null);
    this.htmlDataService.obtenerCuestionario(idLeccion).subscribe(preguntas => {
      this.preguntas.set(preguntas.slice(0, 3));
      this.cargando.set(false);
    });
  }

  pregunta(): HtmlQuizQuestion | null {
    return this.preguntas()[this.preguntaActual()] ?? null;
  }

  responder(indice: number, correcta: boolean): void {
    if (this.respondida() || !this.pregunta()) return;

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
    if (!this.respondida() || !this.esCorrecta()) return;
    if (this.preguntaActual() >= this.preguntas().length - 1) {
      const idLeccion = this.retoPrediccion?.id_leccion;
      if (!idLeccion) return;
      this.cargando.set(true);
      this.missionProgressService.completeMission(idLeccion, this.preguntas().length, this.preguntas().length, 'quiz').subscribe({
        next: respuesta => {
          const xp = Number(respuesta?.data?.xp_awarded ?? 0);
          this.xpGanado.set(xp);
          if (xp > 0) this.xpAwarded.emit(xp);
          this.finalizado.set(true);
          this.cargando.set(false);
        },
        error: error => {
          const mensaje = error?.error?.message || 'Realiza el ejercicio de la consola para obtener tu XP';
          this.mensajeError.set(mensaje);
          this.cargando.set(false);
        }
      });
      return;
    }
    this.preguntaActual.update(indice => indice + 1);
    this.seleccionada.set(null);
    this.respondida.set(false);
    this.esCorrecta.set(false);
  }
}
