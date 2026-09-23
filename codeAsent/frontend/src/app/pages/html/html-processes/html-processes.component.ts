import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { HtmlDataService, HtmlMision } from '../../../services/html-data.service';

const MISIONES_HTML = [
  ['Estructura fundamental', 'Construye el documento HTML5 con doctype, html, head y body.'],
  ['Jerarquía de texto', 'Organiza títulos, subtítulos y párrafos con una lectura clara.'],
  ['Hipervínculos', 'Conecta la expedición con otros destinos usando href.'],
  ['Imágenes', 'Inserta recursos visuales con src y texto alternativo alt.'],
  ['Listas', 'Agrupa HTML, CSS y SQL con ul, ol y li.'],
  ['Tablas', 'Representa nombres y niveles con filas, encabezados y celdas.'],
  ['Formularios', 'Recoge el correo del jugador con label, input y button.'],
  ['Inputs avanzados', 'Declara controles email, number y date según el dato.'],
  ['Semántica', 'Divide la página en header, main, section y footer.'],
  ['Accesibilidad global', 'Declara idioma, identidad y clasificación del documento.']
] as const;

@Component({
  selector: 'app-html-processes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './html-processes.component.html',
  styleUrl: './html-processes.component.scss'
})
export class HtmlProcessesComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  @Output() missionSelected = new EventEmitter<any>();

  private readonly htmlDataService = inject(HtmlDataService);
  
  missions = signal<HtmlMision[]>([]);
  cargando = signal(true);
  errorCarga = signal<string | null>(null);

  ngOnInit(): void {
    this.htmlDataService.obtenerMisiones().subscribe({
      next: misiones => {
        this.missions.set(misiones.map((mision, indice) => {
          const [nombre, descripcion] = MISIONES_HTML[indice] ?? [mision.nivel.nombre, mision.nivel.descripcion];
          return {
            ...mision,
            nivel: { ...mision.nivel, nombre, descripcion }
          };
        }));
        this.cargando.set(false);
      },
      error: error => {
        console.error(error);
        this.errorCarga.set('No se pudieron cargar las misiones HTML.');
        this.cargando.set(false);
      }
    });
  }

  seleccionarMision(mision: any): void {
    if (mision.desbloqueada && mision.reto) {
      const retoParaDashboard = {
        ...mision.reto,
        missionNumber: mision.nivel.numero_nivel,
        leccionContenido: mision.leccion?.contenido || '',
        respuestas: mision.respuestas || mision.reto.respuestas || []
      };
      this.missionSelected.emit(retoParaDashboard);
    }
  }
}
