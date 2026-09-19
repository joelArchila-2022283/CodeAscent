import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import ts from 'typescript';

import { TsDataService } from '../../../services/ts-data.service';
import { EjemploService } from '../../../services/ts-ejemplo.service';
import { RetoService } from '../../../services/ts-reto.service';

import { ILeccion } from '../../../interfaces/leccion.interface';
import { IEjemplo } from '../../../interfaces/ejemplo.interface';
import { IReto } from '../../../interfaces/reto.interface';

interface ContenidoTerminal {

  leccion: ILeccion;

  ejemplo: IEjemplo | null;

  reto: IReto | null;

}

@Component({
  selector: 'app-ts-terminal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './TS-terminal.component.html',
  styleUrl: './TS-terminal.component.scss'
})
export class TsTerminalComponent implements OnInit {

  @Input()
  retoSeleccionado: IReto | null = null;

  @Output()
  back =
    new EventEmitter<void>();

  private tsDataService =
    inject(TsDataService);

  private ejemploService =
    inject(EjemploService);

  private retoService =
    inject(RetoService);

  cargando =
    signal(true);

  errorCarga =
    signal<string | null>(null);

  contenidos =
    signal<ContenidoTerminal[]>([]);

  indiceActual =
    signal(0);

  code =
    signal('');

  output =
    signal('');

  compiled =
    signal(false);

  error =
    signal(false);

  ejecutado =
    signal(false);

  prediccion =
    signal('');

  mostrarPrediccion =
    signal(false);

  feedback =
    signal('');

  mostrarFeedback =
    signal(false);

  finalizado =
    signal(false);

  codigoInicial = '';

  ngOnInit(): void {
    this.cargarContenidos();
  }

  private cargarContenidos(): void {

    this.cargando.set(true);

    this.errorCarga.set(null);

    this.tsDataService
      .obtenerContexto()
      .pipe(

        switchMap(contexto => {

          const niveles =
            contexto.niveles || [];

          if (
            niveles.length === 0
          ) {
            return of([]);
          }

          const peticionesNiveles =
            niveles

              .filter(
                nivel =>
                  !!nivel.id_nivel
              )

              .sort(
                (a, b) =>
                  a.numero_nivel -
                  b.numero_nivel
              )

              .map(
                nivel =>
                  this.obtenerContenidoNivel(
                    nivel.id_nivel!
                  )
              );

          return forkJoin(
            peticionesNiveles
          );

        })

      )

      .subscribe({

        next: contenidos => {

          const lista =
            contenidos.filter(
              (
                contenido
              ): contenido is ContenidoTerminal =>
                contenido !== null
            );

          this.contenidos.set(lista);

          if (
            this.retoSeleccionado?.id_reto
          ) {

            const indice =
              lista.findIndex(
                contenido =>
                  contenido.reto?.id_reto ===
                  this.retoSeleccionado?.id_reto
              );

            if (indice >= 0) {

              this.indiceActual.set(
                indice
              );

            } else {

              this.indiceActual.set(0);

            }

          } else {

            this.indiceActual.set(0);

          }

          if (
            lista.length > 0
          ) {

            this.cargarContenidoActual();

          } else {

            this.errorCarga.set(
              'No existen contenidos TypeScript configurados.'
            );

            this.cargando.set(false);
          }

        },

        error: err => {

          console.error(
            'Error al cargar contenidos TypeScript:',
            err
          );

          this.errorCarga.set(
            'No se pudo cargar el contenido del Terminal.'
          );

          this.cargando.set(false);
        }

      });
  }

  private obtenerContenidoNivel(
    idNivel: number
  ) {

    return this.tsDataService
      .obtenerLeccionesPorNivel(
        idNivel
      )

      .pipe(

        switchMap(lecciones => {

          const leccion =
            lecciones[0];

          if (
            !leccion?.id_leccion
          ) {

            return of(null);

          }

          return forkJoin({

            ejemplo:
              this.ejemploService
                .obtenerPorLeccion(
                  leccion.id_leccion
                )
                .pipe(

                  map(
                    ejemplos =>
                      ejemplos[0] ?? null
                  ),

                  catchError(
                    () => of(null)
                  )

                ),

            reto:
              this.retoService
                .obtenerRetosDeLecciones([
                  leccion.id_leccion
                ])

                .pipe(

                  map(
                    retos =>
                      retos.find(
                        reto =>
                          reto.tipo_reto ===
                          'codigo'
                      ) ?? null
                  ),

                  catchError(
                    () => of(null)
                  )

                )

          })

            .pipe(

              map(
                ({ ejemplo, reto }) => ({

                  leccion,

                  ejemplo,

                  reto

                })

              )

            );

        }),

        catchError(
          () => of(null)
        )

      );
  }

  private cargarContenidoActual(): void {

    const contenido =
      this.contenidos()[
      this.indiceActual()
      ];

    if (!contenido) {
      return;
    }

    this.codigoInicial =
      '// Escribe aquí tu solución TypeScript\n\n';

    this.code.set(
      this.codigoInicial
    );

    this.output.set('');

    this.prediccion.set('');

    this.feedback.set('');

    this.compiled.set(false);

    this.error.set(false);

    this.ejecutado.set(false);

    this.mostrarPrediccion.set(false);

    this.mostrarFeedback.set(false);

    this.finalizado.set(false);

    this.cargando.set(false);
  }

  obtenerNumeroNivel(): number {

    return (
      this.indiceActual() + 1
    );
  }

  obtenerTituloNivel(): string {

    const contenido =
      this.contenidos()[
      this.indiceActual()
      ];

    return (
      contenido?.leccion?.titulo ||
      `Nivel TypeScript ${this.obtenerNumeroNivel()}`
    );
  }

  obtenerTituloReto(): string {

    const contenido =
      this.contenidos()[
      this.indiceActual()
      ];

    return (
      contenido?.reto?.titulo ||
      'RETO TYPESCRIPT'
    );
  }

  obtenerProblema(): string {

    const contenido =
      this.contenidos()[
      this.indiceActual()
      ];

    return (
      contenido?.reto?.descripcion ||
      'Resuelve el problema utilizando TypeScript.'
    );
  }

  obtenerConcepto(): string {

    const contenido =
      this.contenidos()[
      this.indiceActual()
      ];

    return (
      contenido?.leccion?.contenido ||
      ''
    );
  }

  obtenerEjemplo(): string {

    const contenido =
      this.contenidos()[
      this.indiceActual()
      ];

    return (
      contenido?.ejemplo?.codigo ||
      ''
    );
  }

  obtenerXpReto(): number {

    const contenido =
      this.contenidos()[
      this.indiceActual()
      ];

    return (
      contenido?.reto?.xp_recompensa ?? 0
    );
  }

  prepararEjecucion(): void {

    if (
      !this.code().trim()
    ) {

      this.output.set(
        `[TS-TERMINAL]

ERROR: El editor está vacío.

Escribe una solución antes de ejecutar.`
      );

      this.compiled.set(false);

      this.error.set(true);

      return;
    }

    this.mostrarPrediccion.set(
      true
    );

    this.output.set(
      `[TS-TERMINAL]

Antes de ejecutar tu programa:

¿Qué resultado crees que aparecerá
en la terminal?

Escribe tu predicción y después
pulsa "EJECUTAR TS".`
    );
  }

  compile(): void {

    const codigo =
      this.code().trim();

    if (!codigo) {
      return;
    }

    try {

      const resultado =
        ts.transpileModule(
          codigo,
          {
            compilerOptions: {

              target:
                ts.ScriptTarget.ES2020,

              module:
                ts.ModuleKind.ESNext,

              strict: false,

              removeComments: false,

              ignoreDeprecations:
                '6.0'

            },

            reportDiagnostics:
              true

          }
        );

      if (
        resultado.diagnostics &&
        resultado.diagnostics.length > 0
      ) {

        const errores =
          resultado.diagnostics
            .map(diagnostico => {

              const mensaje =
                ts.flattenDiagnosticMessageText(
                  diagnostico.messageText,
                  '\n'
                );

              if (
                diagnostico.file &&
                diagnostico.start !== undefined
              ) {

                const posicion =
                  diagnostico.file
                    .getLineAndCharacterOfPosition(
                      diagnostico.start
                    );

                return (
                  `Línea ${posicion.line + 1}: ${mensaje}`
                );
              }

              return mensaje;

            })
            .join('\n');

        throw new Error(
          errores
        );
      }

      const resultados:
        string[] = [];

      const consoleOriginal =
        console.log;

      console.log =
        (...args: unknown[]) => {

          resultados.push(
            args
              .map(
                valor =>
                  this.formatearResultado(
                    valor
                  )
              )
              .join(' ')
          );

        };

      try {

        const ejecutar =
          new Function(
            resultado.outputText
          );

        ejecutar();

      } finally {

        console.log =
          consoleOriginal;

      }

      const salida =
        resultados.join('\n');

      this.output.set(
        `[TS-TERMINAL]

> COMPILANDO TYPESCRIPT...

COMPILACIÓN CORRECTA.

> EJECUTANDO main.ts...

--------------------------------

SALIDA DEL PROGRAMA

--------------------------------

${salida || 'El programa no produjo ninguna salida.'}

--------------------------------

> PROCESO FINALIZADO

--------------------------------`
      );

      this.compiled.set(true);

      this.error.set(false);

      this.ejecutado.set(true);

      this.generarFeedback(
        salida
      );

      this.registrarIntento(
        true
      );

    } catch (e) {

      const mensaje =
        e instanceof Error
          ? e.message
          : String(e);

      this.output.set(
        `[TS-TERMINAL]

> COMPILANDO TYPESCRIPT...

ERROR

--------------------------------

${mensaje}

--------------------------------

Revisa el código e inténtalo
nuevamente.`
      );

      this.compiled.set(false);

      this.error.set(true);

      this.ejecutado.set(true);

      this.feedback.set(
        'El código no pudo ejecutarse. Revisa el mensaje de error y encuentra qué parte de tu solución está provocando el problema.'
      );

      this.mostrarFeedback.set(
        true
      );

      this.registrarIntento(
        false
      );
    }
  }

  private generarFeedback(
    salida: string
  ): void {

    if (
      !salida.trim()
    ) {

      this.feedback.set(
        'Tu código se ejecutó correctamente, pero no produjo ninguna salida. Revisa el problema y piensa qué información necesitas mostrar mediante console.log().'
      );

      this.mostrarFeedback.set(
        true
      );

      return;
    }

    if (
      this.prediccion().trim()
    ) {

      const prediccion =
        this.prediccion()
          .trim()
          .toLowerCase();

      const resultado =
        salida
          .trim()
          .toLowerCase();

      if (
        resultado.includes(
          prediccion
        )
      ) {

        this.feedback.set(
          'Tu predicción coincide con parte del resultado. Pudiste anticipar correctamente el comportamiento del programa.'
        );

      } else {

        this.feedback.set(
          'El programa se ejecutó correctamente, pero el resultado fue diferente a tu predicción. Compara ambos y descubre qué instrucción produjo la diferencia.'
        );

      }

    } else {

      this.feedback.set(
        'Tu programa se ejecutó correctamente. Analiza la salida y explica mentalmente por qué obtuviste ese resultado.'
      );

    }

    this.mostrarFeedback.set(
      true
    );
  }

  siguienteReto(): void {

    const siguiente =
      this.indiceActual() + 1;

    if (
      siguiente >=
      this.contenidos().length
    ) {

      this.finalizado.set(
        true
      );

      this.feedback.set(
        'Has recorrido todos los retos disponibles de TypeScript.'
      );

      this.mostrarFeedback.set(
        true
      );

      return;
    }

    this.indiceActual.set(
      siguiente
    );

    this.cargarContenidoActual();
  }

  cargarEjemploEnEditor(): void {

    const ejemplo =
      this.obtenerEjemplo();

    if (!ejemplo) {
      return;
    }

    this.code.set(
      ejemplo
    );

    this.output.set('');

    this.feedback.set('');

    this.compiled.set(false);

    this.error.set(false);

    this.ejecutado.set(false);

    this.mostrarPrediccion.set(false);

    this.mostrarFeedback.set(false);
  }

  reset(): void {

    this.code.set(
      this.codigoInicial
    );

    this.output.set('');

    this.prediccion.set('');

    this.feedback.set('');

    this.compiled.set(false);

    this.error.set(false);

    this.ejecutado.set(false);

    this.mostrarPrediccion.set(false);

    this.mostrarFeedback.set(false);
  }

  clear(): void {

    this.code.set('');

    this.output.set('');

    this.prediccion.set('');

    this.feedback.set('');

    this.compiled.set(false);

    this.error.set(false);

    this.ejecutado.set(false);

    this.mostrarPrediccion.set(false);

    this.mostrarFeedback.set(false);
  }

  private registrarIntento(
    correcto: boolean
  ): void {

    const reto =
      this.contenidos()[
        this.indiceActual()
      ]?.reto;

    if (
      !reto?.id_reto
    ) {
      return;
    }

    this.retoService
      .registrarIntento({

        id_reto:
          reto.id_reto,

        respuesta_usuario:
          this.code(),

        correcto,

        xp_obtenida:
          0

      })
      .subscribe({

        next: resultado => {

          if (
            resultado &&
            correcto
          ) {

            this.feedback.set(
              `${this.feedback()}\n\nMisión registrada correctamente. Recompensa: +${reto.xp_recompensa ?? 0} XP.`
            );

          }

        },

        error: err =>
          console.error(
            'Error al registrar intento:',
            err
          )

      });
  }

  private formatearResultado(
    valor: unknown
  ): string {

    if (
      typeof valor === 'object' &&
      valor !== null
    ) {

      try {

        return JSON.stringify(
          valor,
          null,
          2
        );

      } catch {

        return '[Objeto]';

      }

    }

    return String(valor);
  }
}