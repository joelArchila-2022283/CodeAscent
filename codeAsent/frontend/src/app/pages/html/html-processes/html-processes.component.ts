import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { HtmlDataService, HtmlMision } from '../../../services/html-data.service';

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
        this.missions.set(misiones);
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
        leccionContenido: mision.leccion?.contenido || '',
        respuestas: mision.respuestas || mision.reto.respuestas || []
      };
      this.missionSelected.emit(retoParaDashboard);
    }
  }
}