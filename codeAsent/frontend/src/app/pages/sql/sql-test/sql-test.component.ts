import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreguntaTestSql } from '../../../interfaces/sql.interface';

@Component({
  selector: 'app-sql-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sql-test.component.html',
  styleUrls: ['./sql-test.component.scss']
})
export class SqlTestComponent {
  @Output() volver = new EventEmitter<void>();
  @Output() siguiente = new EventEmitter<void>();

  obtenerLetraRespuesta(index: number): string {
    return String.fromCharCode(65 + index);
  }
  preguntas: PreguntaTestSql[] = [
    {
      id_pregunta: 1,
      enunciado: '¿Cuál es la palabra clave para obtener registros de una tabla?',
      opciones: ['GET', 'SELECT', 'EXTRACT', 'FETCH'],
      respuesta_correcta: 1
    },
    {
      id_pregunta: 2,
      enunciado: '¿Qué cláusula se utiliza para filtrar los resultados de una consulta?',
      opciones: ['FILTER', 'HAVING', 'WHERE', 'GROUP BY'],
      respuesta_correcta: 2
    }
  ];

  respuestasUsuario: { [key: number]: number } = {};
  calificacionFinal: number | null = null;

  seleccionarRespuesta(idPregunta: number, indiceOpcion: number) {
    this.respuestasUsuario[idPregunta] = indiceOpcion;
  }

  evaluarTest() {
    let aciertos = 0;
    this.preguntas.forEach(p => {
      if (this.respuestasUsuario[p.id_pregunta] === p.respuesta_correcta) {
        aciertos++;
      }
    });
    this.calificacionFinal = (aciertos / this.preguntas.length) * 100;
  }
}