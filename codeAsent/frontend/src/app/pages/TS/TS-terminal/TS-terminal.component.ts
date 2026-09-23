import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RetoService } from '../../../services/ts-reto.service';
import { MissionProgressService } from '../../../core/services/mission-progress.service';
import { IReto } from '../../../interfaces/reto.interface';

interface PistaTs {
  texto: string;
}

interface LabTs {
  titulo_leccion: string;
  contenido_leccion: string;
  pistas: PistaTs[];
}

interface ReglaTs {
  busquedas: Array<{ patron: string; descripcion: string }>;
}

@Component({ selector: 'app-ts-terminal', standalone: true, imports: [FormsModule], templateUrl: './TS-terminal.component.html', styleUrl: './TS-terminal.component.scss' })
export class TsTerminalComponent implements OnChanges {
  @Input() retoSeleccionado: IReto | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() missionCompleted = new EventEmitter<void>();
  private readonly retoService = inject(RetoService);
  private readonly missionProgressService = inject(MissionProgressService);

  private readonly codigoInicial = '// Escribe aquí tu solución en TypeScript\n';

  cargando = signal(false);
  errorCarga = signal<string | null>(null);
  lab = signal<LabTs | null>(null);
  code = signal(this.codigoInicial);
  output = signal('');
  compiled = signal(false);
  error = signal(false);
  ejecutado = signal(false);
  finalizado = signal(false);
  prediccion = signal('');
  mostrarPrediccion = signal(false);
  feedback = signal('');
  mostrarFeedback = signal(false);
  pistasSolicitadas = signal(0);
  estrellasRestantes = signal(3);

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['retoSeleccionado'] || !this.retoSeleccionado) return;
    this.reset();
    this.lab.set(this.construirLaboratorio(this.retoSeleccionado));
    const idLeccion = (this.retoSeleccionado as any).id_leccion;
    if (idLeccion) {
      this.missionProgressService.updateProgress(idLeccion, 'terminal').subscribe({
        error: () => undefined
      });
    }
  }

  private construirLaboratorio(reto: IReto): LabTs {
    return {
      titulo_leccion: reto.titulo,
      contenido_leccion: (reto as any).contenido || (reto as any).leccionContenido || reto.descripcion || '',
      pistas: this.generarPistas(reto.titulo).map(texto => ({ texto }))
    };
  }

  private generarPistas(titulo: string): string[] {
    const nombre = titulo.toLowerCase();
    if (nombre.includes('interfaz') || nombre.includes('interface')) {
      return ['Describe la forma de un objeto con la palabra interface.', 'Define cada propiedad con un tipo.', 'Tipa la variable con el nombre de la interface.', 'Usa la variable dentro de console.log.'];
    }
    if (nombre.includes('arreglo') || nombre.includes('array') || nombre.includes('lista') || nombre.includes('masiv')) {
      return ['Los datos agrupados se escriben entre corchetes.', 'Tipa el arreglo con [] o Array<tipo>.', 'Accede a un elemento por su índice.', 'Itera el arreglo para imprimir cada elemento.'];
    }
    if (nombre.includes('objeto') || nombre.includes('objet')) {
      return ['Un objeto se define entre llaves.', 'Cada propiedad recibe un tipo.', 'Separa propiedades con coma.', 'Imprime el objeto o una propiedad.'];
    }
    if (nombre.includes('condicion') || nombre.includes('decis') || nombre.includes('if')) {
      return ['Evalúa una condición con la palabra if.', 'Compara valores con operadores como === o >.', 'Dentro del bloque, decide qué imprimir.', 'Cierra el bloque con su llave.'];
    }
    if (nombre.includes('ciclo') || nombre.includes('bucle') || nombre.includes('for') || nombre.includes('repet')) {
      return ['Repite instrucciones con for o while.', 'Declara una variable de control contador.', 'Define la condición que detiene el ciclo.', 'Imprime los resultados dentro del ciclo.'];
    }
    if (nombre.includes('clase') || nombre.includes('class')) {
      return ['Define un molde con la palabra class.', 'Incluye el constructor y sus propiedades.', 'Crea una instancia con la palabra new.', 'Llama a un método o propiedad de la instancia.'];
    }
    if (nombre.includes('funcion') || nombre.includes('funci') || nombre.includes('method')) {
      return ['Declara un bloque reutilizable con function.', 'Tipa los parámetros y el tipo de retorno.', 'Devuelve el resultado con return.', 'Imprime el resultado con console.log.'];
    }
    if (nombre.includes('tipo') || nombre.includes('tipado') || nombre.includes('dato')) {
      return ['Elige el tipo correcto para cada dato.', 'Anota los parámetros con : number o : string.', 'Anota el retorno de la función.', 'Imprime el resultado con console.log.'];
    }
    if (nombre.includes('estructura') || nombre.includes('estruct') || nombre.includes('firm')) {
      return ['Organiza el código en una función principal.', 'Tipa los parámetros y el retorno.', 'Separa la lógica en pasos claros.', 'Cierra cada bloque con su llave.'];
    }
    if (nombre.includes('retorno') || nombre.includes('return') || nombre.includes('devolver')) {
      return ['Usa la palabra return para entregar un valor.', 'Asegúrate de que el tipo coincida.', 'Llama a la función y captura su retorno.', 'Imprime el valor devuelto.'];
    }
    return ['El programa necesita una función principal.', 'Tipa los parámetros y el retorno.', 'Usa console.log para mostrar el resultado.', 'Revisa la llave de cierre de cada bloque.'];
  }

  obtenerTituloReto(): string {
    return this.lab()?.titulo_leccion ?? this.retoSeleccionado?.titulo ?? 'RETO TYPESCRIPT';
  }

  obtenerProblema(): string {
    return this.lab()?.contenido_leccion ?? 'Resuelve el problema utilizando TypeScript.';
  }

  obtenerConcepto(): string {
    return this.lab()?.contenido_leccion ?? '';
  }

  solicitarPista(): void {
    const total = this.lab()?.pistas?.length ?? 0;
    if (total === 0 || this.pistasSolicitadas() >= total) return;
    this.pistasSolicitadas.update(valor => valor + 1);
    this.estrellasRestantes.update(valor => Math.max(0, valor - 1));
  }

  obtenerPista(): string {
    const indice = this.pistasSolicitadas() - 1;
    if (indice < 0) return '';
    return this.lab()?.pistas?.[indice]?.texto ?? '';
  }

  actualizarCodigo(codigo: string): void {
    this.code.set(codigo);
    this.error.set(false);
    this.mostrarFeedback.set(false);
  }

  prepararEjecucion(): void {
    if (!this.code().trim()) {
      this.output.set('[TS-TERMINAL]\n\nERROR: El editor está vacío.\n\nEscribe una solución antes de ejecutar.');
      this.error.set(true);
      return;
    }
    this.mostrarPrediccion.set(true);
    this.output.set('[TS-TERMINAL]\n\nAntes de ejecutar tu programa, escribe una predicción y después pulsa EJECUTAR TS.');
  }

  compile(): void {
    const codigo = this.code().trim();
    if (!codigo) return;

    try {
      const codigoEjecutable = codigo
        .replace(/interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}/g, '')
        .replace(/:\s*(string|number|boolean|any|unknown|never|void)\b/g, '')
        .replace(/\bas\s+(string|number|boolean|any|unknown)\b/g, '');

      const resultados: string[] = [];
      const consoleOriginal = console.log;
      console.log = (...args: unknown[]) => {
        resultados.push(args.map(valor => this.formatearResultado(valor)).join(' '));
      };

      try {
        new Function(codigoEjecutable)();
      } finally {
        console.log = consoleOriginal;
      }

      const salida = resultados.join('\n');

      if (this.retoSeleccionado && !this.validarCodigoTS(codigo)) {
        this.output.set(
          `[TS-TERMINAL]\n\n` +
          `> COMPILANDO TYPESCRIPT...\n\n` +
          `COMPILACIÓN CORRECTA.\n\n` +
          `> VERIFICANDO REQUISITOS DE LA MISIÓN...\n\n` +
          `--------------------------------\n\n` +
          `${salida || 'El programa no produjo ninguna salida.'}\n\n` +
          `--------------------------------\n\n` +
          `REQUISITOS PENDIENTES\n\n` +
          `${this.obtenerRequisitosPendientes().join('\n')}\n\n` +
          `--------------------------------`
        );
        this.compiled.set(false);
        this.error.set(true);
        this.ejecutado.set(true);
        this.feedback.set(this.obtenerDiagnostico());
        this.mostrarFeedback.set(true);
        return;
      }

      this.output.set(
        `[TS-TERMINAL]\n\n` +
        `> COMPILANDO TYPESCRIPT...\n\n` +
        `COMPILACIÓN CORRECTA.\n\n` +
        `> EJECUTANDO main.ts...\n\n` +
        `--------------------------------\n\n` +
        `SALIDA DEL PROGRAMA\n\n` +
        `--------------------------------\n\n` +
        `${salida || 'El programa no produjo ninguna salida.'}\n\n` +
        `--------------------------------\n\n` +
        `> MISIÓN CUMPLIDA\n\n` +
        `--------------------------------`
      );

      this.compiled.set(true);
      this.error.set(false);
      this.ejecutado.set(true);
      this.feedback.set('¡Excelente! Tu solución cumple el objetivo de la misión.');
      this.mostrarFeedback.set(true);

      this.registrarEstadisticasTerminal();
      this.registrarIntento();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      this.output.set(
        `[TS-TERMINAL]\n\n` +
        `> COMPILANDO TYPESCRIPT...\n\n` +
        `ERROR\n\n` +
        `--------------------------------\n\n` +
        `${mensaje}\n\n` +
        `--------------------------------`
      );
      this.compiled.set(false);
      this.error.set(true);
      this.ejecutado.set(true);
      this.feedback.set('El código no pudo ejecutarse. Revisa el mensaje y encuentra qué parte de tu solución provoca el error.');
      this.mostrarFeedback.set(true);
    }
  }

  private registrarEstadisticasTerminal(): void {
    const idLeccion = (this.retoSeleccionado as any)?.id_leccion;
    if (!idLeccion) return;
    this.missionProgressService.updateTerminalStats(
      idLeccion,
      { prediccion_correcta: this.prediccion().trim().length > 0, pistas_usadas: this.pistasSolicitadas() }
    ).subscribe({ error: () => undefined });
  }

  private registrarIntento(): void {
    const reto = this.retoSeleccionado;
    if (!reto?.id_reto) return;
    this.retoService.registrarIntento({
      id_reto: reto.id_reto,
      respuesta_usuario: this.code(),
      correcto: true,
      xp_obtenida: 0
    }).subscribe({
      next: () => this.missionCompleted.emit(),
      error: () => this.missionCompleted.emit()
    });
  }

  siguienteReto(): void {
    if (!this.retoSeleccionado) return;
    this.finalizado.set(true);
    this.missionCompleted.emit();
  }

  private validarCodigoTS(codigo: string): boolean {
    if (!this.retoSeleccionado) return false;
    const regla = this.obtenerReglaTS(this.retoSeleccionado.titulo);
    return regla.busquedas.every(({ patron }) => this.coincide(codigo, patron));
  }

  private obtenerRequisitosPendientes(): string[] {
    if (!this.retoSeleccionado) return [];
    return this.obtenerReglaTS(this.retoSeleccionado.titulo)
      .busquedas
      .filter(({ patron }) => !this.coincide(this.code(), patron))
      .map(({ descripcion }) => `- ${descripcion}`);
  }

  private obtenerDiagnostico(): string {
    const pendientes = this.obtenerRequisitosPendientes();
    return pendientes.length
      ? `Tu solución compila pero no cumple el objetivo de la misión. Revisa los requisitos pendientes:\n${pendientes.join('\n')}`
      : 'El código todavía no cumple el objetivo. Usa una pista si lo necesitas.';
  }

  private coincide(codigo: string, patron: string): boolean {
    try {
      return new RegExp(patron).test(codigo);
    } catch {
      return false;
    }
  }

  private obtenerReglaTS(titulo: string): ReglaTs {
    const nombre = titulo.toLowerCase();
    if (nombre.includes('interfaz') || nombre.includes('interface')) {
      return {
        busquedas: [
          { patron: 'interface', descripcion: 'Define una interface' },
          { patron: '\\w+\\s*:\\s*(string|number|boolean|any)', descripcion: 'Tipa al menos una propiedad' },
          { patron: 'console\\.log|function|const|let', descripcion: 'Usa la interface en el programa' }
        ]
      };
    }
    if (nombre.includes('arreglo') || nombre.includes('array') || nombre.includes('lista') || nombre.includes('masiv')) {
      return {
        busquedas: [
          { patron: '\\[\\]|Array<', descripcion: 'Usa un arreglo tipado con [] o Array<tipo>' },
          { patron: 'for\\s*\\(|forEach|\\.map\\(|while\\s*\\(', descripcion: 'Itera los elementos del arreglo' },
          { patron: 'console\\.log', descripcion: 'Imprime los elementos con console.log' }
        ]
      };
    }
    if (nombre.includes('objeto') || nombre.includes('objet')) {
      return {
        busquedas: [
          { patron: '\\{[\\s\\S]*\\}', descripcion: 'Crea un objeto con llaves' },
          { patron: ':\\s*(string|number|boolean|any)', descripcion: 'Tipa las propiedades del objeto' },
          { patron: 'console\\.log|function', descripcion: 'Usa el objeto en el programa' }
        ]
      };
    }
    if (nombre.includes('condicion') || nombre.includes('decis') || nombre.includes('if')) {
      return {
        busquedas: [
          { patron: 'if\\s*\\(', descripcion: 'Evalúa una condición con if' },
          { patron: '===|==|!==|!=|>|<|>=|<=|&&|\\|\\|', descripcion: 'Compara valores en la condición' },
          { patron: 'console\\.log', descripcion: 'Imprime el resultado con console.log' }
        ]
      };
    }
    if (nombre.includes('ciclo') || nombre.includes('bucle') || nombre.includes('for') || nombre.includes('repet')) {
      return {
        busquedas: [
          { patron: 'for\\s*\\(|while\\s*\\(', descripcion: 'Repite instrucciones con for o while' },
          { patron: '\\b(i|j|contador|indice|elemento)\\b', descripcion: 'Usa una variable de control' },
          { patron: 'console\\.log', descripcion: 'Imprime los resultados con console.log' }
        ]
      };
    }
    if (nombre.includes('clase') || nombre.includes('class')) {
      return {
        busquedas: [
          { patron: 'class', descripcion: 'Define una clase con class' },
          { patron: 'constructor', descripcion: 'Incluye el constructor' },
          { patron: 'new ', descripcion: 'Crea una instancia con new' }
        ]
      };
    }
    if (nombre.includes('funcion') || nombre.includes('funci') || nombre.includes('method')) {
      return {
        busquedas: [
          { patron: 'function', descripcion: 'Declara una función con function' },
          { patron: 'return', descripcion: 'Devuelve un valor con return' },
          { patron: 'console\\.log', descripcion: 'Imprime el resultado con console.log' }
        ]
      };
    }
    if (nombre.includes('tipo') || nombre.includes('tipado') || nombre.includes('dato')) {
      return {
        busquedas: [
          { patron: ':\\s*(string|number|boolean|any)', descripcion: 'Anota el tipo de al menos una variable o parámetro' },
          { patron: 'function', descripcion: 'Declara una función' },
          { patron: 'console\\.log', descripcion: 'Imprime el resultado con console.log' }
        ]
      };
    }
    if (nombre.includes('estructura') || nombre.includes('estruct') || nombre.includes('firm')) {
      return {
        busquedas: [
          { patron: 'function', descripcion: 'Organiza el código en una función principal' },
          { patron: ':', descripcion: 'Tipa los parámetros o el retorno' },
          { patron: 'console\\.log', descripcion: 'Imprime el resultado con console.log' }
        ]
      };
    }
    if (nombre.includes('retorno') || nombre.includes('return') || nombre.includes('devolver')) {
      return {
        busquedas: [
          { patron: 'return', descripcion: 'Devuelve un valor con return' },
          { patron: 'function', descripcion: 'Declara la función que devuelve el valor' },
          { patron: 'console\\.log', descripcion: 'Imprime el valor devuelto' }
        ]
      };
    }
    return {
      busquedas: [
        { patron: 'function', descripcion: 'Declara una función principal' },
        { patron: ':\\s*(string|number|boolean|any)', descripcion: 'Tipa los parámetros o el retorno' },
        { patron: 'console\\.log', descripcion: 'Imprime el resultado con console.log' }
      ]
    };
  }

  reset(): void {
    this.code.set(this.codigoInicial);
    this.output.set('');
    this.prediccion.set('');
    this.compiled.set(false);
    this.error.set(false);
    this.ejecutado.set(false);
    this.finalizado.set(false);
    this.mostrarPrediccion.set(false);
    this.mostrarFeedback.set(false);
    this.pistasSolicitadas.set(0);
    this.estrellasRestantes.set(3);
  }

  clear(): void {
    this.code.set('');
    this.output.set('');
    this.prediccion.set('');
    this.compiled.set(false);
    this.error.set(false);
    this.ejecutado.set(false);
    this.mostrarPrediccion.set(false);
    this.mostrarFeedback.set(false);
  }

  private formatearResultado(valor: unknown): string {
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'object') return JSON.stringify(valor);
    return String(valor);
  }
}