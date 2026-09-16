import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import ts from 'typescript';

@Component({
  selector: 'app-ts-terminal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './TS-terminal.component.html',
  styleUrl: './TS-terminal.component.scss'
})
export class TsTerminalComponent {

  @Output() back = new EventEmitter<void>();

  code = signal(
`interface Usuario {
  nombre: string;
  nivel: number;
}

const jugador: Usuario = {
  nombre: 'Cadete Bit',
  nivel: 5
};

console.log('Hola ' + jugador.nombre);
console.log('Nivel: ' + jugador.nivel);
console.log('Nivel siguiente: ' + (jugador.nivel + 1));`
  );

  output = signal('');
  compiled = signal(false);
  error = signal(false);

  compile(): void {

    const codigo = this.code().trim();

    if (!codigo) {
      this.output.set(
`[TS-TERMINAL]

ERROR: El terminal está vacío.

Escribe código TypeScript
antes de ejecutar.`
      );

      this.compiled.set(false);
      this.error.set(true);
      return;
    }

    try {


      const resultado = ts.transpileModule(codigo, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    strict: false,
    removeComments: false,
    ignoreDeprecations: '6.0'
  },
  reportDiagnostics: true
});


      if (resultado.diagnostics && resultado.diagnostics.length > 0) {

        const errores = resultado.diagnostics
          .map(diagnostico => {

            const mensaje = ts.flattenDiagnosticMessageText(
              diagnostico.messageText,
              '\n'
            );

            if (diagnostico.file && diagnostico.start !== undefined) {

              const posicion =
                diagnostico.file.getLineAndCharacterOfPosition(
                  diagnostico.start
                );

              return `Línea ${posicion.line + 1}: ${mensaje}`;
            }

            return mensaje;
          })
          .join('\n');

        throw new Error(errores);
      }

      const resultados: string[] = [];

      const consoleOriginal = console.log;

      console.log = (...args: unknown[]) => {

        const texto = args
          .map(valor => this.formatearResultado(valor))
          .join(' ');

        resultados.push(texto);
      };

      try {

        const ejecutar = new Function(resultado.outputText);

        ejecutar();

      } finally {

        console.log = consoleOriginal;
      }


      if (resultados.length === 0) {

        this.output.set(
`[TS-TERMINAL]
> COMPILANDO TYPESCRIPT...

COMPILACIÓN CORRECTA.

> EJECUTANDO main.ts...

El programa terminó correctamente,
pero no produjo ninguna salida.

Agrega:

console.log("Hola");`
        );

      } else {

        this.output.set(
`[TS-TERMINAL]
> COMPILANDO TYPESCRIPT...

COMPILACIÓN CORRECTA.

> EJECUTANDO main.ts...

--------------------------------
SALIDA DEL PROGRAMA
--------------------------------

${resultados.join('\n')}

--------------------------------
> PROCESO FINALIZADO
--------------------------------`
        );
      }

      this.compiled.set(true);
      this.error.set(false);

    } catch (e) {

      this.output.set(
`[TS-TERMINAL]
> COMPILANDO TYPESCRIPT...

ERROR

--------------------------------
${e instanceof Error ? e.message : String(e)}
--------------------------------

Revisa el código e inténtalo
nuevamente.`
      );

      this.compiled.set(false);
      this.error.set(true);
    }
  }

  private formatearResultado(valor: unknown): string {

    if (typeof valor === 'object' && valor !== null) {

      try {
        return JSON.stringify(valor, null, 2);
      } catch {
        return '[Objeto]';
      }
    }

    return String(valor);
  }

  clear(): void {

    this.code.set('');
    this.output.set('');
    this.compiled.set(false);
    this.error.set(false);
  }

  reset(): void {

    this.code.set(
`interface Usuario {
  nombre: string;
  nivel: number;
}

const jugador: Usuario = {
  nombre: 'Cadete Bit',
  nivel: 5
};

console.log('Hola ' + jugador.nombre);
console.log('Nivel: ' + jugador.nivel);
console.log('Nivel siguiente: ' + (jugador.nivel + 1));`
    );

    this.output.set('');
    this.compiled.set(false);
    this.error.set(false);
  }
}