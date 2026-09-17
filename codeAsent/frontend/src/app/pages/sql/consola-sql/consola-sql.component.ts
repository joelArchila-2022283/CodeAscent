import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesafioConsolaSql } from '../../../interfaces/sql.interface';

@Component({
  selector: 'app-consola-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consola-sql.component.html',
  styleUrls: ['./consola-sql.component.scss']
})
export class ConsolaSqlComponent {
  etapaActual = signal<number>(1);

  desafioActivo = signal<DesafioConsolaSql>({
    idDesafio: 'desafio-sql-01',
    codigoIdentificador: 'SQL-M1',
    tituloDesafio: 'Filtrar Transistores Activos',
    planteamientoProblema: 'El sistema del árbol central necesita obtener únicamente los registros de transistores cuya tensión sea mayor a 50 voltios para evitar un cortocircuito.',
    preguntaRazonamiento: 'Antes de escribir la consulta, ¿qué cláusula de SQL permite condicionar o filtrar las filas de una tabla?',
    opcionesPrediccion: ['ORDER BY', 'WHERE', 'GROUP BY', 'HAVING'],
    indicePrediccionCorrecta: 1,
    pistasAndamiaje: [
      { nivelPista: 1, textoExplicativo: '¿Qué palabra clave en español equivale a indicar una condición como "Donde la tensión sea mayor a 50"?', penalizacionEstrellas: 1 },
      { nivelPista: 2, textoExplicativo: 'En SQL se utiliza SELECT * FROM tabla WHERE condicion.', penalizacionEstrellas: 1 },
      { nivelPista: 3, textoExplicativo: 'Escribe: SELECT * FROM transistores WHERE tension > 50;', penalizacionEstrellas: 1 },
      { nivelPista: 4, textoExplicativo: 'Solución directa: SELECT * FROM transistores WHERE tension > 50;', penalizacionEstrellas: 3 }
    ],
    consultaSqlCorrecta: 'SELECT * FROM transistores WHERE tension > 50;',
    retroalimentacionExito: '¡Excelente! Filtraste correctamente los transistores activos. La cláusula WHERE evitó sobrecargar el circuito.',
    explicacionErrorSintaxis: 'La consulta no devolvió los datos esperados. Revisa qué campo controla el voltaje de los transistores.'
  });

  prediccionSeleccionada = signal<number | null>(null);
  prediccionCorrecta = signal<boolean | null>(null);
  codigoIngresado = signal<string>('SELECT * FROM transistores');
  pistasSolicitadas = signal<number>(0);
  estrellasRestantes = signal<number>(3);
  resultadoEjecucion = signal<string | null>(null);
  ejecucionExitosa = signal<boolean>(false);
  columnasResultado = ['id_transistor', 'nombre', 'tension', 'estado'];
  filasResultado = signal<Array<Record<string, string | number>>>([]);

  validarPrediccion(indiceOpcion: number): void {
    this.prediccionSeleccionada.set(indiceOpcion);
    const esCorrecto = indiceOpcion === this.desafioActivo().indicePrediccionCorrecta;
    this.prediccionCorrecta.set(esCorrecto);
  }

  avanzarAEditor(): void {
    this.etapaActual.set(3);
  }

  actualizarCodigo(evento: Event): void {
    const elemento = evento.target as HTMLTextAreaElement;
    this.codigoIngresado.set(elemento.value);
  }

  solicitarPista(): void {
    const actual = this.pistasSolicitadas();
    if (actual < this.desafioActivo().pistasAndamiaje.length) {
      const nuevaPista = this.desafioActivo().pistasAndamiaje[actual];
      this.pistasSolicitadas.set(actual + 1);
      
      const nuevasEstrellas = Math.max(0, this.estrellasRestantes() - nuevaPista.penalizacionEstrellas);
      this.estrellasRestantes.set(nuevasEstrellas);
    }
  }

  ejecutarConsultaSql(): void {
    const ingresoLimpio = this.codigoIngresado().trim().toLowerCase().replace(/\s+/g, ' ');

    this.etapaActual.set(4);

    if (ingresoLimpio.includes('where') && ingresoLimpio.includes('tension > 50')) {
      this.ejecucionExitosa.set(true);
      this.resultadoEjecucion.set(this.desafioActivo().retroalimentacionExito);
      this.filasResultado.set([
        { id_transistor: 2, nombre: 'Bobina Norte', tension: 72, estado: 'ACTIVO' },
        { id_transistor: 4, nombre: 'Bobina Central', tension: 110, estado: 'ACTIVO' },
        { id_transistor: 5, nombre: 'Bobina Sur', tension: 86, estado: 'ACTIVO' }
      ]);
    } else {
      this.ejecucionExitosa.set(false);
      this.resultadoEjecucion.set(this.desafioActivo().explicacionErrorSintaxis);
      this.filasResultado.set([]);
    }
  }
}