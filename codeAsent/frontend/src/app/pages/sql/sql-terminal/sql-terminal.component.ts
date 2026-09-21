import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RetoSql } from '../../../interfaces/sql.interface';
import { SqlEstadoService } from '../../../services/sql-estado.service';

@Component({
  selector: 'app-sql-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sql-terminal.component.html',
  styleUrls: ['./sql-terminal.component.scss']
})
export class SqlTerminalComponent implements OnInit {
  private readonly sqlEstadoService = inject(SqlEstadoService);

  @Output() volver = new EventEmitter<void>();
  @Output() progresoActualizado = new EventEmitter<{ xpTotal: number; xpObtenida: number }>();

  retoEnCurso: RetoSql | null = null;

  comandoUsuario = '';
  huboErrorEjecucion = false;
  preguntaDiagnostica = '';
  pistaRevelada = false;
  textoPistaActual = '';
  bannerEstado = '';
  tipoBanner: 'success' | 'warning' | 'error' | '' = '';
  estrellasRestantes = 3;

  ngOnInit(): void {
    this.retoEnCurso = this.sqlEstadoService.obtenerRetoActivo();
    if (this.retoEnCurso) {
      this.actualizarBanner('Terminal lista. Ejecuta la respuesta de la misión activa.', 'success');
    } else {
      this.actualizarBanner('Selecciona una misión antes de abrir la terminal.', 'warning');
    }
  }

  procesarComando() {
    if (!this.retoEnCurso || !this.comandoUsuario.trim()) {
      this.actualizarBanner('Escribe una sentencia SQL antes de ejecutar.', 'warning');
      return;
    }

    const comandoLimpio = this.comandoUsuario.trim().toLowerCase();
    this.huboErrorEjecucion = false;
    this.sqlEstadoService.enviarRespuesta(this.retoEnCurso.id_reto, this.comandoUsuario.trim()).subscribe({
      next: (respuesta) => {
        this.progresoActualizado.emit(respuesta);
        if (respuesta.correcto) {
          const recompensa = respuesta.xpObtenida > 0 ? `+${respuesta.xpObtenida} XP` : 'XP ya reclamada';
          this.actualizarBanner(`Misión completada. ${recompensa}. ${respuesta.nivelCompletado ? 'Nuevo nivel desbloqueado.' : ''}`, 'success');
        } else {
          this.huboErrorEjecucion = true;
          this.generarDiagnostico(comandoLimpio);
          this.actualizarBanner('La consulta fue recibida, pero no coincide con la respuesta de la misión.', 'error');
        }
      },
      error: () => this.actualizarBanner('No se pudo registrar la ejecución. Conserva tu consulta y vuelve a intentarlo.', 'error')
    });
  }

  generarDiagnostico(comando: string) {
    if (!comando.includes('select')) {
      this.preguntaDiagnostica = '¿Olvidaste la cláusula principal para extraer datos (SELECT)?';
    } else if (!comando.includes('from')) {
      this.preguntaDiagnostica = '¿Especificaste de qué tabla quieres sacar la información usando FROM?';
    } else {
      this.preguntaDiagnostica = 'Revisa la sintaxis general. ¿Estás llamando a la tabla "productos" correctamente?';
    }
  }

  solicitarPista(nivel: number) {
    if (!this.retoEnCurso || nivel > this.retoEnCurso.pistas_disponibles.length) {
      this.actualizarBanner('Esta misión no tiene más pistas registradas.', 'warning');
      return;
    }
    this.pistaRevelada = true;
    this.estrellasRestantes = Math.max(0, this.estrellasRestantes - 1);
    this.textoPistaActual = this.retoEnCurso.pistas_disponibles[nivel - 1];
    this.actualizarBanner(`Pista ${nivel} revelada. Te quedan ${this.estrellasRestantes} estrellas de precisión.`, 'warning');
  }

  private actualizarBanner(mensaje: string, tipo: 'success' | 'warning' | 'error' | ''): void {
    this.bannerEstado = mensaje;
    this.tipoBanner = tipo;
  }
}