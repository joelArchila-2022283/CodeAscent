import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LeccionSql {
  id: string;
  codigoIdentificador: string;
  titulo: string;
  subtitulo: string;
  explicacionConceptual: string;
  ejemploConsulta: string;
  puntosClave: string[];
}

@Component({
  selector: 'app-manual-tecnico-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manual-tecnico-sql.component.html',
  styleUrls: ['./manual-tecnico-sql.component.scss']
})
export class ManualTecnicoSqlComponent {
  indiceLeccionSeleccionada = signal<number>(0);

  lecciones: LeccionSql[] = [
    {
      id: 'sql-doc-01',
      codigoIdentificador: 'SQL-DOC-01',
      titulo: 'Anatomía de una Consulta SELECT',
      subtitulo: 'La tubería básica de extracción de información',
      explicacionConceptual: 'En las bases de datos relacionales, una consulta SELECT permite extraer filamentos específicos de datos sin alterar la estructura original de las tablas.',
      ejemploConsulta: `SELECT id_transistor, voltaje, estado\nFROM registro_valle\nWHERE estado = 'ACTIVO';`,
      puntosClave: [
        'SELECT: Especifica qué columnas o datos deseas extraer.',
        'FROM: Señala la tabla donde se encuentran almacenados los registros.',
        'WHERE: Aplica un filtro lógico para seleccionar filas específicas.'
      ]
    },
    {
      id: 'sql-doc-02',
      codigoIdentificador: 'SQL-DOC-02',
      titulo: 'Filtrado con Condicionales (WHERE)',
      subtitulo: 'Aislamiento de señales y prevención de fallos',
      explicacionConceptual: 'Utiliza comparadores (<, >, =, !=) y conectores booleanos (AND, OR) para refinar los criterios de búsqueda.',
      ejemploConsulta: `SELECT nombre_arbol, cantidad_cables\nFROM bosque_transistores\nWHERE cantidad_cables >= 10 AND tipo = 'COBRE';`,
      puntosClave: [
        'Operadores de Comparación: Determinan si un valor cumple la regla.',
        'AND / OR: Combinan múltiples reglas en un solo circuito de búsqueda.'
      ]
    }
  ];

  seleccionarLeccion(indice: number): void {
    this.indiceLeccionSeleccionada.set(indice);
  }
}