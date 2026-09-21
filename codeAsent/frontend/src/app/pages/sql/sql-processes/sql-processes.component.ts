import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { RetoSql } from '../../../interfaces/sql.interface';
import { SqlEstadoService } from '../../../services/sql-estado.service';

@Component({
  selector: 'app-sql-processes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sql-processes.component.html',
  styleUrls: ['./sql-processes.component.scss']
})
export class SqlProcessesComponent implements OnInit {
  private readonly sqlEstadoService = inject(SqlEstadoService);

  @Output() retoSeleccionado = new EventEmitter<RetoSql>();
  listaRetosSql: RetoSql[] = [];
  errorCarga = '';

  ngOnInit(): void {
    this.sqlEstadoService.obtenerNivelesDesdeBackend().subscribe({
      next: (retos) => {
        this.listaRetosSql = retos;
        this.errorCarga = retos.length ? '' : 'La ruta SQL respondió sin niveles activos.';
      },
      error: (error: unknown) => {
        const detalle = typeof error === 'object' && error !== null && 'error' in error
          ? (error as { error?: { message?: string } }).error?.message
          : undefined;
        this.errorCarga = detalle || 'No se pudieron cargar las misiones SQL. Revisa que el servidor y la base de datos estén conectados.';
        this.listaRetosSql = [];
      }
    });
  }

  cargarReto(retoSeleccionado: RetoSql) {
    if (!retoSeleccionado.desbloqueado) {
      return;
    }

    this.sqlEstadoService.establecerRetoActivo(retoSeleccionado);
    this.retoSeleccionado.emit(retoSeleccionado);
  }
}