import { Component, Input, OnChanges, Output, EventEmitter, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NivelSql, SeccionSql, MisionSql } from '../../../interfaces/sql.interface';

@Component({
  selector: 'app-misiones-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './misiones-sql.component.html',
  styleUrls: ['./misiones-sql.component.scss']
})
export class MisionesSqlComponent implements OnChanges {
  @Input() niveles: NivelSql[] = [];
  @Input() nivelActivo: NivelSql | null = null;
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

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.niveles.length === 0) return;
    this.listaMisiones.set(this.niveles.map(nivel => ({
      idMision: `nivel-${nivel.id_nivel}`,
      codigoIdentificador: `NIVEL ${nivel.numero_nivel}`,
      tituloMision: nivel.nombre,
      descripcionMision: nivel.descripcion || 'Resuelve el problema, consulta el manual y demuestra lo aprendido.',
      recompensaExperiencia: nivel.xp_requerida || 0,
      estadoMision: nivel.id_nivel === this.nivelActivo?.id_nivel ? 'en_progreso' : nivel.numero_nivel === 1 ? 'en_progreso' : 'bloqueada',
      seccionDestino: 'manual',
      requisitoDesbloqueo: nivel.numero_nivel === 1 ? 'Disponible' : 'Completa el nivel anterior'
    })));
  }

  irAMision(seccion: SeccionSql): void {
    this.navegarA.emit(seccion);
  }
}