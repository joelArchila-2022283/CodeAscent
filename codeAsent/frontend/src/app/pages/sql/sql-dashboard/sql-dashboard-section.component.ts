import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { RetoSql, SeccionSql } from '../../../interfaces/sql.interface';
import { SqlEstadoService } from '../../../services/sql-estado.service';

@Component({
  selector: 'app-sql-dashboard-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sql-dashboard-section.component.html',
  styleUrls: ['./sql-dashboard-section.component.scss']
})
export class SqlDashboardSectionComponent implements OnInit {
  private readonly sqlEstadoService = inject(SqlEstadoService);
  @Output() cambioDeVista = new EventEmitter<SeccionSql>();
  retos: RetoSql[] = [];

  ngOnInit(): void {
    this.sqlEstadoService.obtenerNivelesDesdeBackend().subscribe(retos => this.retos = retos);
  }

  get completadas(): number {
    return this.retos.filter(reto => reto.completado).length;
  }

  get disponibles(): number {
    return this.retos.filter(reto => reto.desbloqueado && !reto.completado).length;
  }

  get xpRuta(): number {
    return this.retos.reduce((total, reto) => total + Number(reto.xp_recompensa || 0), 0);
  }

  seleccionarVista(vista: SeccionSql) {
    this.cambioDeVista.emit(vista);
  }
}