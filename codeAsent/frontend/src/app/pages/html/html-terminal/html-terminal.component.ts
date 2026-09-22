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
  @Output() back = new EventEmitter<void>();
  @Output() missionCompleted = new EventEmitter<number>();
  private readonly missionProgressService = inject(MissionProgressService);

  code = signal('<!DOCTYPE html>\n<html>\n<head><title>Mi página</title></head>\n<body><h1>Hola, HTML</h1><p>Mi primera expedición web.</p></body>\n</html>');
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
    const titulo = this.retoSeleccionado?.titulo.toLowerCase() || '';
    const pistas = titulo.includes('estructura')
      ? ['Piensa en la raíz del documento.', 'Usa html, head y body.', 'No olvides declarar HTML5.', 'Incluye <!DOCTYPE html>.']
      : titulo.includes('texto')
        ? ['Necesitas elementos de bloque.', 'Usa una jerarquía de encabezados.', 'Combina h1 con p.', 'La solución necesita <h1> y <p>.']
        : titulo.includes('hiperv')
          ? ['Un enlace necesita un destino.', 'Busca la etiqueta a.', 'Revisa su atributo href.', 'Usa <a href="/ruta">Enlace</a>.']
          : titulo.includes('imagen')
            ? ['La imagen necesita una fuente.', 'Usa img.', 'Añade src y alt.', 'Usa <img src="imagen.jpg" alt="Descripción">.']
            : titulo.includes('lista')
              ? ['Una lista contiene elementos.', 'Usa ul u ol.', 'Cada elemento debe ser li.', 'Incluye al menos tres li.']
              : titulo.includes('tabla')
                ? ['Piensa en filas y celdas.', 'Usa table y tr.', 'Añade th o td dentro de tr.', 'Construye una tabla con table, tr y td.']
                : titulo.includes('formulario')
                  ? ['Agrupa los campos.', 'Usa form, input y button.', 'Revisa el atributo type.', 'Incluye <form><input><button>.']
                  : titulo.includes('contenedor')
                    ? ['Hay elementos de bloque y línea.', 'Compara div y span.', 'Usa el contenedor pedido.', 'Incluye div y span.']
                    : titulo.includes('semánt')
                      ? ['HTML puede describir regiones.', 'Usa etiquetas semánticas.', 'Piensa en header, main y footer.', 'Incluye header, main y footer.']
                      : ['Los identificadores describen elementos.', 'Revisa id y class.', 'Un id debe ser único.', 'Incluye id y class.'];
    return pistas[Math.max(0, this.pistasSolicitadas() - 1)];
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
            })),
        switchMap(() => this.missionProgressService.completeMission(this.retoSeleccionado!.id_leccion, 1, 1, 'terminal'))
      ).subscribe({
        next: respuesta => {
          this.missionCompleted.emit(Number(respuesta?.data?.xp_awarded ?? 0));
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
    const regla = this.obtenerRegla(this.retoSeleccionado.titulo);

    return regla.tags.every(tag => documento.querySelector(tag) !== null)
      && (regla.atributos || []).every(({ tag, atributo }) => {
        const elemento = documento.querySelector(tag);
        return elemento?.hasAttribute(atributo) === true;
      })
      && (regla.minimos || []).every(({ tag, cantidad }) =>
        documento.querySelectorAll(tag).length >= cantidad
      );
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
