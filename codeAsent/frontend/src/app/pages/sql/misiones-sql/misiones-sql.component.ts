import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeccionSql, MisionSql } from '../../../interfaces/sql.interface';

@Component({
  selector: 'app-misiones-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './misiones-sql.component.html',
  styleUrls: ['./misiones-sql.component.scss']
})
export class MisionesSqlComponent {
  @Output() navegarA = new EventEmitter<SeccionSql>();

  listaMisiones = signal<MisionSql[]>([
    {
      idMision: 'm-sql-01',
      codigoIdentificador: 'MISIÓN 01',
      tituloMision: 'Sintonizar Señal de Transistores',
      descripcionMision: 'Lee la Lección SQL-DOC-01 en el Manual Técnico.',
      recompensaExperiencia: 50,
      estadoMision: 'completada',
      seccionDestino: 'manual',
      requisitoDesbloqueo: 'Completado'
    },
    {
      idMision: 'm-sql-02',
      codigoIdentificador: 'MISIÓN 02',
      tituloMision: 'Filtrado de Voltaje de Seguridad',
      descripcionMision: 'Ejecuta con éxito la consulta del reto en la Terminal SQL.',
      recompensaExperiencia: 100,
      estadoMision: 'en_progreso',
      seccionDestino: 'consola',
      requisitoDesbloqueo: 'Ejecutar consulta válida'
    }
  ]);

  irAMision(seccion: SeccionSql): void {
    this.navegarA.emit(seccion);
  }
}