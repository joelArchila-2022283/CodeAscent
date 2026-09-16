import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class CuestionariosSqlComponent {
  indicePreguntaActual = signal<number>(0);
  opcionSeleccionada = signal<number | null>(null);
  respuestaVerificada = signal<boolean>(false);
  puntuacion = signal<number>(0);
  quizFinalizado = signal<boolean>(false);

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
    }
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