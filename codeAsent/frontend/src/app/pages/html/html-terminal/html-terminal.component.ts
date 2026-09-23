import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { MissionProgressService } from '../../../core/services/mission-progress.service';
import { IReto } from '../../../interfaces/reto.interface';

interface ReglaHtml {
  tags: string[];
  atributos?: Array<{ tag: string; atributo: string }>;
  minimos?: Array<{ tag: string; cantidad: number }>;
}

interface DiagnosticoHtml {
  error: string;
  sintoma: string;
  preguntaGuia: string;
}

interface RequisitoHtml {
  etiqueta: string;
  selector: string;
  completado: boolean;
}

@Component({ selector: 'app-html-terminal', standalone: true, imports: [FormsModule], templateUrl: './html-terminal.component.html', styleUrl: './html-terminal.component.scss' })
export class HtmlTerminalComponent implements OnChanges, OnDestroy {
  @Input() retoSeleccionado: IReto | null = null;
  @Input() missionNumber = 1;
  @Output() back = new EventEmitter<void>();
  @Output() missionCompleted = new EventEmitter<void>();
  private readonly missionProgressService = inject(MissionProgressService);

  private readonly codigoEjemplo = '<!DOCTYPE html>\n<html>\n<head><title>Mi página</title></head>\n<body><h1>Hola, HTML</h1><p>Mi primera expedición web.</p></body>\n</html>';
  code = signal(this.codigoEjemplo);
  saved = signal(false);
  resultado = signal<string | null>(null);
  ejecucionExitosa = signal(false);
  pistasSolicitadas = signal(0);
  estrellasRestantes = signal(4);
  diagnostico = signal<DiagnosticoHtml[]>([]);
  cargando = signal(false);
  private guardadoPendiente: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['retoSeleccionado'] || !this.retoSeleccionado) return;
    this.code.set('');
    this.saved.set(false);
    this.resultado.set(null);
    this.ejecucionExitosa.set(false);
    this.pistasSolicitadas.set(0);
    this.estrellasRestantes.set(4);
    this.diagnostico.set([]);
    this.cargando.set(false);
    this.missionProgressService.getProgress(this.retoSeleccionado.id_leccion).subscribe(progreso => {
      if (progreso.data.terminal_code) this.code.set(progreso.data.terminal_code);
    });
  }

  ngOnDestroy(): void {
    if (this.guardadoPendiente) clearTimeout(this.guardadoPendiente);
    this.guardarBorrador();
  }

  solicitarPista(): void {
    if (this.pistasSolicitadas() >= 4) return;
    this.pistasSolicitadas.update(valor => valor + 1);
    this.estrellasRestantes.update(valor => Math.max(0, valor - 1));
  }

  obtenerPista(): string {
    const pistasPorMision: Record<number, string[]> = {
      1: ['Empieza por la raíz del documento.', 'Declara HTML5 con <!DOCTYPE html>.', 'Separa metadatos y contenido con <head> y <body>.', 'Usa <!DOCTYPE html><html><head>...</head><body>...</body></html>.'],
      2: ['Piensa en una jerarquía de lectura.', 'El título principal usa <h1>.', 'Añade subtítulos con <h2> y texto con <p>.', 'Prueba <h1>Título</h1><p>Descripción</p>.'],
      3: ['Necesitas un elemento que pueda recibir clic.', 'Usa la etiqueta <a>.', 'El destino se declara con href.', 'Escribe <a href="https://ejemplo.com">Visitar</a>.'],
      4: ['La imagen necesita una fuente y una descripción.', 'Usa la etiqueta <img>.', 'Incluye src y alt con contenido.', 'Prueba <img src="mapa.jpg" alt="Mapa de la expedición">.'],
      5: ['Primero decide si el orden importa.', 'Usa <ul> o <ol> como contenedor.', 'Cada elemento debe ser un <li>.', 'Incluye tres elementos: <ul><li>Uno</li><li>Dos</li><li>Tres</li></ul>.'],
      6: ['Imagina filas y columnas.', 'Envuelve la información en <table>.', 'Cada fila usa <tr> y cada celda <th> o <td>.', 'Construye <table><tr><th>Nombre</th></tr><tr><td>HTML</td></tr></table>.'],
      7: ['Agrupa los controles que recogerán datos.', 'El contenedor principal es <form>.', 'Relaciona <label> con <input> y termina con <button>.', 'Prueba <form><label for="correo">Correo</label><input id="correo"><button>Enviar</button></form>.'],
      8: ['El tipo del control expresa la intención del dato.', 'Necesitas tres controles input.', 'Usa email, number y date.', 'Incluye <input type="email"><input type="number"><input type="date">.'],
      9: ['Organiza la página por regiones con significado.', 'Usa header, main y footer.', 'Dentro de main puedes colocar una section.', 'Prueba <header>...</header><main><section>...</section></main><footer>...</footer>.'],
      10: ['Los atributos globales describen el documento.', 'Declara el idioma en html con lang.', 'Añade una identidad id y una clasificación class.', 'Usa <html lang="es" id="documento" class="pagina">.']
    };
    const titulo = this.retoSeleccionado?.titulo.toLowerCase() || '';
    const pistas = pistasPorMision[this.missionNumber] || [
      'Identifica qué elemento representa la intención de la misión.',
      'Revisa la etiqueta principal y sus atributos.',
      'Comprueba que la estructura esté completa.',
      `Relaciona la solución con el reto «${titulo}».`
    ];
    return pistas[Math.max(0, this.pistasSolicitadas() - 1)];
  }

  vistaPrevia(): string {
    const codigo = this.code().replace(
      /src=(['"])(?!https?:|data:|\/|#)([^'"]+)\1/gi,
      'src="/assets/images/map-world.jpg"'
    );
    return `<!doctype html><html><head><meta charset="UTF-8"><style>
      html,body{margin:0;min-height:100%;background:transparent;color:#fff!important;font-family:Arial,sans-serif}
      body{padding:1rem}
      body *{color:#fff!important}
      img{max-width:100%;height:auto;display:block}
    </style></head><body>${codigo}</body></html>`;
  }

  aplicarColorVistaPrevia(evento: Event): void {
    const iframe = evento.target as HTMLIFrameElement;
    const documento = iframe.contentDocument;
    if (!documento) return;

    const estilo = documento.createElement('style');
    estilo.textContent = 'html, body, body * { color: #fff !important; }';
    documento.head.appendChild(estilo);
  }

  render(): void {
    if (this.cargando() || !this.retoSeleccionado) return;
    this.cargando.set(true);
    const valido = this.validarCodigoHTML(this.code());
    this.saved.set(valido);
    this.ejecucionExitosa.set(valido);
    this.resultado.set(valido
      ? '¡Excelente! El documento cumple el objetivo de la misión.'
      : 'El código todavía no cumple el objetivo. Revisa la misión y usa una pista si lo necesitas.');
    this.diagnostico.set(valido ? [] : this.obtenerDiagnostico(this.code()));

    if (valido && this.retoSeleccionado?.id_reto) {
      this.missionProgressService.updateProgress(this.retoSeleccionado.id_leccion, 'lesson').pipe(
        switchMap(() => this.missionProgressService.updateProgress(this.retoSeleccionado!.id_leccion, 'terminal')),
        switchMap(() => this.missionProgressService.updateTerminalStats(this.retoSeleccionado!.id_leccion, {
               prediccion_correcta: true,
               pistas_usadas: this.pistasSolicitadas(),
               codigo: this.code()
             }))
      ).subscribe({
        next: respuesta => {
          this.missionCompleted.emit();
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false)
      });
    } else {
      this.cargando.set(false);
    }
  }

  actualizarCodigo(codigo: string): void {
    this.code.set(codigo);
    this.diagnostico.set([]);
    this.ejecucionExitosa.set(false);
    if (this.guardadoPendiente) clearTimeout(this.guardadoPendiente);
    this.guardadoPendiente = setTimeout(() => this.guardarBorrador(), 400);
  }

  restaurarEjemplo(): void {
    this.code.set(this.codigoEjemplo);
    this.resultado.set(null);
    this.ejecucionExitosa.set(false);
    this.diagnostico.set([]);
    this.guardarBorrador();
  }

  limpiarCodigo(): void {
    this.code.set('');
    this.resultado.set(null);
    this.ejecucionExitosa.set(false);
    this.diagnostico.set([]);
    this.guardarBorrador();
  }

  copiarCodigo(): void {
    const clipboard = navigator.clipboard;
    if (!clipboard) return;
    clipboard.writeText(this.code()).then(() => {
      this.resultado.set('Código copiado al portapapeles.');
    });
  }

  private guardarBorrador(): void {
    if (!this.retoSeleccionado?.id_leccion) return;
    this.missionProgressService.saveTerminalDraft(this.retoSeleccionado.id_leccion, this.code()).subscribe();
  }

  obtenerRequisitos(): RequisitoHtml[] {
    const codigo = this.code();
    const titulo = this.retoSeleccionado?.titulo.toLowerCase() || '';
    const documento = new DOMParser().parseFromString(codigo, 'text/html');
    const requiereEstructura = titulo.includes('estructura') || titulo.includes('ubicación') || titulo.includes('ubicacion');

    if (requiereEstructura) {
      return [
        { etiqueta: '<!DOCTYPE html>', selector: 'doctype', completado: /^\s*<!doctype\s+html\s*>/i.test(codigo) },
        { etiqueta: '<html>', selector: 'html', completado: /<html\b[^>]*>/i.test(codigo) },
        { etiqueta: '<head>', selector: 'head', completado: /<head\b[^>]*>[\s\S]*?<\/head\s*>/i.test(codigo) },
        { etiqueta: '<body>', selector: 'body', completado: /<body\b[^>]*>[\s\S]*?<\/body\s*>/i.test(codigo) }
      ];
    }

    if (this.missionNumber === 4) {
      const imagen = Array.from(documento.querySelectorAll('img'))
        .find(elemento => elemento.getAttribute('src')?.trim() && elemento.getAttribute('alt')?.trim());
      return [
        { etiqueta: '<img>', selector: 'img', completado: Boolean(imagen) },
        { etiqueta: 'src="cualquier-ruta"', selector: 'src', completado: Boolean(imagen?.getAttribute('src')?.trim()) },
        { etiqueta: 'alt="descripción"', selector: 'alt', completado: Boolean(imagen?.getAttribute('alt')?.trim()) }
      ];
    }

    if (this.missionNumber === 3) {
      const enlace = documento.querySelector('a');
      return [
        { etiqueta: '<a>', selector: 'a', completado: Boolean(enlace) },
        { etiqueta: 'href="destino"', selector: 'href', completado: Boolean(enlace?.getAttribute('href')?.trim()) }
      ];
    }

    if (this.missionNumber === 5) {
      return [
        { etiqueta: '<ul> o <ol>', selector: 'lista', completado: Boolean(documento.querySelector('ul, ol')) },
        { etiqueta: '<li>', selector: 'li', completado: documento.querySelectorAll('ul > li, ol > li').length > 0 },
        { etiqueta: 'Al menos 3 elementos', selector: 'minimo-li', completado: documento.querySelectorAll('ul > li, ol > li').length >= 3 }
      ];
    }

    if (this.missionNumber === 6) {
      return [
        { etiqueta: '<table>', selector: 'table', completado: Boolean(documento.querySelector('table')) },
        { etiqueta: '<tr>', selector: 'tr', completado: Boolean(documento.querySelector('table tr')) },
        { etiqueta: '<td>', selector: 'td', completado: Boolean(documento.querySelector('table tr td')) }
      ];
    }

    if (this.missionNumber === 7) {
      return [
        { etiqueta: '<form>', selector: 'form', completado: Boolean(documento.querySelector('form')) },
        { etiqueta: '<label>', selector: 'label', completado: Boolean(documento.querySelector('form label')) },
        { etiqueta: '<input>', selector: 'input', completado: Boolean(documento.querySelector('form input')) },
        { etiqueta: '<button>', selector: 'button', completado: Boolean(documento.querySelector('form button')) }
      ];
    }

    if (this.missionNumber === 8) {
      return ['email', 'number', 'date'].map(tipo => ({
        etiqueta: `<input type="${tipo}">`,
        selector: `input[type="${tipo}"]`,
        completado: Boolean(documento.querySelector(`input[type="${tipo}"]`))
      }));
    }

    if (this.missionNumber === 9) {
      return ['header', 'nav', 'main', 'section', 'footer'].map(etiqueta => ({
        etiqueta: `<${etiqueta}>`,
        selector: etiqueta,
        completado: Boolean(documento.querySelector(etiqueta))
      }));
    }

    if (this.missionNumber === 10) {
      const ids = Array.from(documento.querySelectorAll('[id]')).map(elemento => elemento.id);
      return [
        { etiqueta: 'lang="es"', selector: 'lang', completado: Boolean(documento.querySelector('html')?.getAttribute('lang')?.trim()) },
        { etiqueta: 'id único', selector: 'id', completado: ids.length > 0 && new Set(ids).size === ids.length },
        { etiqueta: 'class', selector: 'class', completado: Boolean(documento.querySelector('[class]')) },
        { etiqueta: 'aria-label', selector: 'aria-label', completado: Boolean(documento.querySelector('[aria-label]')) }
      ];
    }

    return this.obtenerRegla(titulo).tags.map(tag => ({
      etiqueta: `<${tag}>`,
      selector: tag,
      completado: documento.querySelector(tag) !== null
    }));
  }

  private validarCodigoHTML(codigo: string): boolean {
    if (!this.retoSeleccionado) return false;
    const documento = new DOMParser().parseFromString(codigo, 'text/html');
    const titulo = this.retoSeleccionado.titulo.toLowerCase();
    if (titulo.includes('estructura') || titulo.includes('ubicación') || titulo.includes('ubicacion')) {
      return this.obtenerRequisitos().every(requisito => requisito.completado);
    }
    return this.obtenerRequisitos().every(requisito => requisito.completado);
  }

  private obtenerRegla(titulo: string): ReglaHtml {
    const nombre = titulo.toLowerCase();
    if (nombre.includes('estructura')) return { tags: ['html', 'head', 'body'] };
    if (nombre.includes('texto')) return { tags: ['h1', 'p'] };
    if (nombre.includes('hiperv')) return { tags: ['a'], atributos: [{ tag: 'a', atributo: 'href' }] };
    if (nombre.includes('imagen')) return { tags: ['img'], atributos: [{ tag: 'img', atributo: 'src' }, { tag: 'img', atributo: 'alt' }] };
    if (nombre.includes('lista')) return { tags: ['ul', 'li'], minimos: [{ tag: 'li', cantidad: 3 }] };
    if (nombre.includes('tabla')) return { tags: ['table', 'tr', 'td'] };
    if (nombre.includes('formulario')) return { tags: ['form', 'input', 'button'] };
    if (nombre.includes('input')) return { tags: ['input'], atributos: [{ tag: 'input[type="email"]', atributo: 'type' }, { tag: 'input[type="number"]', atributo: 'type' }, { tag: 'input[type="date"]', atributo: 'type' }] };
    if (nombre.includes('semánt')) return { tags: ['header', 'main', 'footer'] };
    return { tags: ['body'], atributos: [{ tag: '[id]', atributo: 'id' }, { tag: '[class]', atributo: 'class' }] };
  }

  private obtenerDiagnostico(codigo: string): DiagnosticoHtml[] {
    const documento = new DOMParser().parseFromString(codigo, 'text/html');
    const titulo = this.retoSeleccionado?.titulo.toLowerCase() || '';
    const diagnosticos: DiagnosticoHtml[] = [];

    if (titulo.includes('texto') && !documento.querySelector('h1')) {
      diagnosticos.push({ error: 'Falta el encabezado principal', sintoma: 'La portada no tiene una jerarquía clara.', preguntaGuia: '¿Qué etiqueta representa el título principal?' });
    }
    if (titulo.includes('texto') && !documento.querySelector('p')) {
      diagnosticos.push({ error: 'Falta el párrafo descriptivo', sintoma: 'No existe contenido explicativo visible.', preguntaGuia: '¿Qué etiqueta contiene un bloque de texto?' });
    }
    if (titulo.includes('imagen') && !documento.querySelector('img[alt]')) {
      diagnosticos.push({ error: 'La imagen no tiene texto alternativo', sintoma: 'Un lector de pantalla no puede describirla.', preguntaGuia: '¿Qué atributo explica una imagen cuando no puede verse?' });
    }
    if (titulo.includes('input') && !documento.querySelector('input[type="email"]')) {
      diagnosticos.push({ error: 'Falta el control email', sintoma: 'El formulario no valida correos nativamente.', preguntaGuia: '¿Qué valor de type representa una dirección de correo?' });
    }
    if (titulo.includes('lista') && documento.querySelectorAll('li').length < 3) {
      diagnosticos.push({ error: 'La lista tiene pocos elementos', sintoma: 'El inventario no representa tres recursos.', preguntaGuia: '¿Cada recurso está dentro de un li?' });
    }
    if (diagnosticos.length === 0) {
      diagnosticos.push({ error: 'La estructura aún no coincide', sintoma: 'El navegador puede renderizar, pero no cumple el objetivo pedagógico.', preguntaGuia: '¿Qué requisito técnico de la misión falta revisar?' });
    }
    return diagnosticos;
  }
}
