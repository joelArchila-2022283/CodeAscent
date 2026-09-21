import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqlEstadoService } from '../../../services/sql-estado.service';
import { RetoSql, EsquemaTabla } from '../../../interfaces/sql.interface';

@Component({
  selector: 'app-sql-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sql-data.component.html',
  styleUrls: ['./sql-data.component.scss']
})
export class SqlDataComponent {
  @Output() volver = new EventEmitter<void>();
  @Output() siguiente = new EventEmitter<void>();
  // Definición de esquemas relacionales para el manual de campo
  tablasRequeridas: EsquemaTabla[] = [
    {
      nombre_tabla: 'productos',
      descripcion_tabla: 'Almacena el catálogo principal de artículos registrados en el Valle de Transistores.',
      columnas: ['id_producto (INT)', 'nombre (VARCHAR)', 'precio (DECIMAL)', 'stock (INT)']
    },
    {
      nombre_tabla: 'categorias',
      descripcion_tabla: 'Clasificación lógica de componentes y transistores del entorno.',
      columnas: ['id_categoria (INT)', 'nombre_categoria (VARCHAR)', 'descripcion (TEXT)']
    }
  ];

  constructor(private sqlEstadoService: SqlEstadoService) {}

  get retoActivo(): RetoSql | null {
    return this.sqlEstadoService.obtenerRetoActivo();
  }
}