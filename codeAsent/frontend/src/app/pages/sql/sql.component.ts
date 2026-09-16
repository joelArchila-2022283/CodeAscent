import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeccionSql, JugadorSql } from '../../interfaces/sql.interface';
import { PanelSqlComponent } from './panel-sql/panel-sql.component';
import { ManualTecnicoSqlComponent } from './manual-tecnico-sql/manual-tecnico-sql.component';
import { MisionesSqlComponent } from './misiones-sql/misiones-sql.component';
import { ConsolaSqlComponent } from './consola-sql/consola-sql.component';
import { CuestionariosSqlComponent } from './cuestionarios-sql/cuestionarios-sql.component';

@Component({
  selector: 'app-sql',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PanelSqlComponent,
    ManualTecnicoSqlComponent,
    MisionesSqlComponent,
    ConsolaSqlComponent,
    CuestionariosSqlComponent
  ],
  templateUrl: './sql.component.html',
  styleUrls: ['./sql.component.scss']
})
export class SqlComponent {
  seccionActiva = signal<SeccionSql>('panel');

  datosJugador = signal<JugadorSql>({
    nombreJugador: 'Cadete Bit',
    tituloRango: 'Explorador del Valle de Transistores',
    nivelProgreso: 2,
    experienciaActual: 240,
    experienciaSiguienteNivel: 500,
    transistoresActivos: 3,
    totalTransistores: 5,
    estrellasTotales: 12
  });

  mascotDialogue = signal<string>('¡Sintoniza las bobinas de datos, Cadete!');

  cambiarSeccion(nuevaSeccion: SeccionSql): void {
    this.seccionActiva.set(nuevaSeccion);
  }
}