import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';

export interface ManualParsed {
  conceptual: string;
  logico: string;
  sintactico: string;
}

interface ConstructionMap {
  title: string;
  objective: string;
  root: string;
  nodes: Array<{ tag: string; label: string }>;
}

@Component({
  selector: 'app-html-data',
  templateUrl: './html-data.component.html',
  styleUrls: ['./html-data.component.scss']
})
export class HtmlDataComponent implements OnChanges {
  @Input() leccionRaw: string = '';
  @Input() missionNumber = 1;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  manual = signal<ManualParsed>({ conceptual: 'Selecciona una misión para cargar el manual.', logico: '...', sintactico: '...' });
  readonly mapas: ConstructionMap[] = [
    { title: 'Esqueleto del documento', objective: 'Construye la raíz y separa metadatos de contenido visible.', root: '<html>', nodes: [{ tag: '<!DOCTYPE html>', label: 'estándar HTML5' }, { tag: '<head>', label: 'metadatos' }, { tag: '<body>', label: 'contenido visible' }] },
    { title: 'Jerarquía del texto', objective: 'Organiza un título principal y su contenido descriptivo.', root: '<body>', nodes: [{ tag: '<h1>', label: 'título principal' }, { tag: '<h2>', label: 'subtítulo' }, { tag: '<p>', label: 'párrafo' }] },
    { title: 'Puente de navegación', objective: 'Conecta el contenido con otra ubicación mediante un destino.', root: '<a>', nodes: [{ tag: 'href', label: 'destino obligatorio' }, { tag: 'target', label: 'contexto opcional' }, { tag: 'texto', label: 'contenido accionable' }] },
    { title: 'Imagen accesible', objective: 'Inserta una imagen que pueda entenderse aunque no sea visible.', root: '<img>', nodes: [{ tag: 'src', label: 'ruta del recurso' }, { tag: 'alt', label: 'descripción accesible' }, { tag: 'width', label: 'dimensión opcional' }] },
    { title: 'Lista estructurada', objective: 'Agrupa elementos relacionados usando el contenedor correcto.', root: '<ul> / <ol>', nodes: [{ tag: '<li>', label: 'elemento de lista' }, { tag: '<ul>', label: 'orden libre' }, { tag: '<ol>', label: 'orden numérico' }] },
    { title: 'Tabla de datos', objective: 'Representa información en filas, encabezados y celdas.', root: '<table>', nodes: [{ tag: '<tr>', label: 'fila' }, { tag: '<th>', label: 'encabezado' }, { tag: '<td>', label: 'dato' }] },
    { title: 'Formulario interactivo', objective: 'Recoge datos con campos identificables y una acción.', root: '<form>', nodes: [{ tag: '<label>', label: 'indicación del campo' }, { tag: '<input>', label: 'dato' }, { tag: '<button>', label: 'acción' }] },
    { title: 'Tipos de entrada', objective: 'Declara controles que expresen la intención del dato.', root: '<input>', nodes: [{ tag: 'type="email"', label: 'correo' }, { tag: 'type="number"', label: 'cantidad' }, { tag: 'type="date"', label: 'fecha' }] },
    { title: 'Estructura semántica', objective: 'Explica el propósito de cada región de la página.', root: '<main>', nodes: [{ tag: '<header>', label: 'cabecera' }, { tag: '<section>', label: 'sección' }, { tag: '<footer>', label: 'pie' }] },
    { title: 'Accesibilidad global', objective: 'Identifica el documento y declara su idioma para hacerlo interpretable.', root: '<html>', nodes: [{ tag: 'lang="es"', label: 'idioma' }, { tag: 'id', label: 'identidad única' }, { tag: 'class', label: 'clasificación' }] }
  ];

  mapa = signal<ConstructionMap>(this.mapas[0]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['missionNumber']) {
      this.mapa.set(this.mapas[Math.max(0, Math.min(9, this.missionNumber - 1))]);
    }
    if (changes['leccionRaw']) {
      this.procesarLeccion();
    }
  }

  procesarLeccion(): void {
    if (!this.leccionRaw) return;

    const extraer = (inicio: string, fin?: string) => {
      const idxInicio = this.leccionRaw.indexOf(inicio);
      if (idxInicio === -1) return '';
      const start = idxInicio + inicio.length;
      if (!fin) return this.leccionRaw.substring(start).trim();
      const idxFin = this.leccionRaw.indexOf(fin, start);
      return idxFin === -1 ? this.leccionRaw.substring(start).trim() : this.leccionRaw.substring(start, idxFin).trim();
    };

    this.manual.set({
      conceptual: extraer('NIVEL CONCEPTUAL:', 'NIVEL LOGICO:') || this.leccionRaw,
      logico: extraer('NIVEL LOGICO:', 'NIVEL SINTACTICO:'),
      sintactico: extraer('NIVEL SINTACTICO:', 'PROBLEMA ABP:')
    });
  }
}
