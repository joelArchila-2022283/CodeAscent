import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesafioConsolaSql, RetoNivelSql } from '../../../interfaces/sql.interface';

@Component({
  selector: 'app-consola-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consola-sql.component.html',
  styleUrls: ['./consola-sql.component.scss']
})
export class ConsolaSqlComponent implements OnChanges {
  @Input() retoSeleccionado: RetoNivelSql | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() missionCompleted = new EventEmitter<number>();
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
      { nivelPista: 1, textoExplicativo: 'Recuerda el orden lógico de ejecución: primero se define el origen de los datos (FROM), después el filtro. ¿Qué cláusula aplica una condición sobre las filas de la tabla?', penalizacionEstrellas: 2 },
      { nivelPista: 2, textoExplicativo: 'En español, "donde la tensión sea mayor a 50" se traduce en SQL como WHERE tension > 50.', penalizacionEstrellas: 1 },
      { nivelPista: 3, textoExplicativo: 'Une el origen con el filtro: SELECT ... FROM transistores WHERE tension > 50.', penalizacionEstrellas: 1 },
      { nivelPista: 4, textoExplicativo: 'Casi tienes la solución completa: SELECT * FROM transistores WHERE tension > 50; compárala con lo que escribiste.', penalizacionEstrellas: 0 }
    ],
    consultaSqlCorrecta: 'SELECT * FROM transistores WHERE tension > 50;',
    retroalimentacionExito: '¡Excelente! Filtraste correctamente los transistores activos. La cláusula WHERE evitó sobrecargar el circuito.',
    explicacionErrorSintaxis: 'La consulta no devolvió los datos esperados. Revisa qué campo controla el voltaje de los transistores.'
  });

  prediccionSeleccionada = signal<number | null>(null);
  prediccionCorrecta = signal<boolean | null>(null);
  codigoIngresado = signal<string>('SELECT * FROM transistores');
  pistasSolicitadas = signal<number>(0);
  estrellasRestantes = signal<number>(4);
  resultadoEjecucion = signal<string | null>(null);
  ejecucionExitosa = signal<boolean>(false);
  columnasResultado = ['id_transistor', 'nombre', 'tension', 'estado'];
  filasResultado = signal<Array<Record<string, string | number>>>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['retoSeleccionado'] || !this.retoSeleccionado) return;

    const reto = this.retoSeleccionado;
    const respuestas = reto.respuestas || [];
    const indiceCorrecto = Math.max(0, respuestas.findIndex(respuesta => respuesta.es_correcta));
    this.desafioActivo.set({
      idDesafio: `reto-${reto.id_reto}`,
      codigoIdentificador: `SQL-R${reto.id_reto}`,
      tituloDesafio: reto.titulo,
      planteamientoProblema: reto.descripcion,
      preguntaRazonamiento: 'Antes de escribir, predice qué concepto SQL necesitas aplicar.',
      opcionesPrediccion: respuestas.length ? respuestas.map(respuesta => respuesta.contenido) : ['SELECT', 'WHERE', 'GROUP BY', 'ORDER BY'],
      indicePrediccionCorrecta: indiceCorrecto,
      pistasAndamiaje: [
        { nivelPista: 1, textoExplicativo: '¿Qué concepto central de la lección te permite resolver este problema? Relaciona la teoría con las operaciones sobre la tabla.', penalizacionEstrellas: 2 },
        { nivelPista: 2, textoExplicativo: 'Identifica qué tabla actúa como origen de los datos y qué condición define las filas que necesitas.', penalizacionEstrellas: 1 },
        { nivelPista: 3, textoExplicativo: 'Escribe una consulta pequeña con las columnas y condiciones clave, y compruébala en la terminal.', penalizacionEstrellas: 1 },
        { nivelPista: 4, textoExplicativo: 'Casi lo tienes: revisa el ejemplo del manual y compara su estructura con tu sentencia.', penalizacionEstrellas: 0 }
      ],
      consultaSqlCorrecta: respuestas.find(respuesta => respuesta.es_correcta)?.contenido || 'SELECT * FROM tabla_objetivo;',
      retroalimentacionExito: '¡Excelente! Tu solución conecta el razonamiento con la sintaxis SQL.',
      explicacionErrorSintaxis: 'La consulta no produjo el resultado esperado. Revisa qué parte del problema controla el filtro o la selección.'
    });
    this.etapaActual.set(1);
    this.prediccionSeleccionada.set(null);
    this.prediccionCorrecta.set(null);
    this.pistasSolicitadas.set(0);
    this.estrellasRestantes.set(4);
    this.codigoIngresado.set('');
  }

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

  nombrePista(nivelPista: number): string {
    const nombres = ['Conceptual', 'Orientativa', 'Específica', 'Casi Solución'];
    return nombres[nivelPista - 1] ?? `Pista ${nivelPista}`;
  }

  ejecutarConsultaSql(): void {
    const ingresoLimpio = this.codigoIngresado().trim().toLowerCase().replace(/\s+/g, ' ');
    const respuestaCorrectaLimpia = this.desafioActivo().consultaSqlCorrecta.trim().toLowerCase().replace(/\s+/g, ' ');

    this.etapaActual.set(4);

    const valida = ingresoLimpio.includes('select')
      && ingresoLimpio.includes('where')
      && (respuestaCorrectaLimpia.includes('tension')
        ? ingresoLimpio.includes('tension') && ingresoLimpio.includes('> 50')
        : ingresoLimpio.length > 0);

    if (valida) {
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

  continuarAlCuestionario(): void {
    this.missionCompleted.emit(this.retoSeleccionado?.xp_recompensa ?? 0);
  }
}