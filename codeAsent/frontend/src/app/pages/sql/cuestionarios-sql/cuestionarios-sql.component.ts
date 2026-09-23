import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NivelSql } from '../../../interfaces/sql.interface';
import { RetoService } from '../../../services/ts-reto.service';

interface PreguntaSql {
  id: number;
  pregunta: string;
  opciones: string[];
  indiceCorrecto: number;
  explicacionFormativa: string;
}

@Component({
  selector: 'app-cuestionarios-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuestionarios-sql.component.html',
  styleUrls: ['./cuestionarios-sql.component.scss']
})
export class CuestionariosSqlComponent implements OnChanges {
  @Input() nivelActivo: NivelSql | null = null;
  @Output() xpAwarded = new EventEmitter<number>();
  private readonly retoService = inject(RetoService);
  indicePreguntaActual = signal<number>(0);
  opcionSeleccionada = signal<number | null>(null);
  respuestaVerificada = signal<boolean>(false);
  puntuacion = signal<number>(0);
  quizFinalizado = signal<boolean>(false);
  xpGanado = signal<number>(0);

  preguntas: PreguntaSql[] = [
    {
      id: 1,
      pregunta: '¿Cuál es la palabra clave de SQL utilizada para especificar la tabla de origen de donde se extraen las filas?',
      opciones: ['SELECT', 'FROM', 'WHERE', 'DATABASE'],
      indiceCorrecto: 1,
      explicacionFormativa: '¡Correcto! La cláusula FROM indica el origen exacto de los datos en el esquema.'
    },
    {
      id: 2,
      pregunta: '¿Qué operador lógico debes utilizar si deseas que se cumplan DOS condiciones simultáneamente en un WHERE?',
      opciones: ['OR', 'AND', 'NOT', 'BOTH'],
      indiceCorrecto: 1,
      explicacionFormativa: '¡Exacto! El operador AND exige que todas las condiciones evaluadas sean verdaderas.'
    }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['nivelActivo'] || !this.nivelActivo) return;
    const retos = this.nivelActivo.retos.filter(reto => reto.tipo_reto === 'opcion_multiple' && reto.respuestas.length > 0);
    if (retos.length === 0) {
      this.preguntas = [{
        id: this.nivelActivo.id_nivel,
        pregunta: `¿Qué concepto debes aplicar en el nivel «${this.nivelActivo.nombre}»?`,
        opciones: ['Analizar el problema', 'Ignorar la descripción', 'Repetir sin pensar', 'Usar cualquier comando'],
        indiceCorrecto: 0,
        explicacionFormativa: 'Primero comprende el problema y después traduce esa idea a una consulta SQL.'
      }];
    } else {
      this.preguntas = retos.map(reto => ({
        id: reto.id_reto,
        pregunta: reto.descripcion,
        opciones: reto.respuestas.map(respuesta => respuesta.contenido),
        indiceCorrecto: Math.max(0, reto.respuestas.findIndex(respuesta => respuesta.es_correcta)),
        explicacionFormativa: `Revisa el concepto «${this.nivelActivo!.nombre}» y explica por qué esa respuesta resuelve el problema.`
      }));
    }
    this.indicePreguntaActual.set(0);
    this.opcionSeleccionada.set(null);
    this.respuestaVerificada.set(false);
    this.puntuacion.set(0);
    this.quizFinalizado.set(false);
    this.xpGanado.set(0);
  }

  seleccionarRespuesta(indice: number): void {
    if (!this.respuestaVerificada()) {
      this.opcionSeleccionada.set(indice);
    }
  }

  verificarRespuesta(): void {
    if (this.opcionSeleccionada() === null) return;
    this.respuestaVerificada.set(true);

    if (this.opcionSeleccionada() === this.preguntas[this.indicePreguntaActual()].indiceCorrecto) {
      this.puntuacion.update(p => p + 1);
      const reto = this.nivelActivo?.retos.find(
        item => item.id_reto === this.preguntas[this.indicePreguntaActual()].id
      );
      if (reto) {
        this.retoService.registrarIntentoConXp({
          id_reto: reto.id_reto,
          respuesta_usuario: reto.respuestas[this.opcionSeleccionada()!]?.contenido,
          correcto: true
        }).subscribe(xp => {
          this.xpGanado.update(total => total + xp);
          if (xp > 0) this.xpAwarded.emit(xp);
        });
      }
    }
  }

  reintentar(): void {
    this.respuestaVerificada.set(false);
    this.opcionSeleccionada.set(null);
  }

  siguientePregunta(): void {
    if (this.indicePreguntaActual() < this.preguntas.length - 1) {
      this.indicePreguntaActual.update(i => i + 1);
      this.opcionSeleccionada.set(null);
      this.respuestaVerificada.set(false);
    } else {
      this.quizFinalizado.set(true);
    }
  }
}
