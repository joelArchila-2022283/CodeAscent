import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { IMission } from '../../../core/models/language.model';
import { RetoService } from '../../../services/ts-reto.service';

interface MisionViewTs {
  id: number;
  code: string;
  title: string;
  detail: string;
  desbloqueada: boolean;
  completada: boolean;
  mision: IMission;
}

@Component({
  selector: 'app-ts-processes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-processes.component.html',
  styleUrl: './TS-processes.component.scss'
})
export class TSProcessesComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  @Output() missionSelected = new EventEmitter<any>();

  private readonly languageService = inject(LanguageService);
  private readonly retoService = inject(RetoService);

  missions = signal<MisionViewTs[]>([]);
  cargando = signal(true);
  errorCarga = signal<string | null>(null);

  ngOnInit(): void {
    this.languageService.obtenerMisionesPorSlug('typescript').subscribe({
      next: respuesta => {
        const misiones = [...(respuesta.data || [])].sort((a, b) =>
          (a.numero_nivel ?? a.orden) - (b.numero_nivel ?? b.orden)
        );
        this.missions.set(
          misiones.map((mision, index) => {
            const numero = mision.numero_nivel ?? index + 1;
            const completada = mision.estado === 'completed';
            const anteriorCompletada = index === 0 || misiones[index - 1].estado === 'completed';
            return {
              id: numero,
              code: `TS-${String(numero).padStart(2, '0')}`,
              title: mision.titulo,
              detail: this.resumirContenido(mision.contenido),
              desbloqueada: anteriorCompletada,
              completada,
              mision
            };
          })
        );
        this.cargando.set(false);
      },
      error: error => {
        console.error(error);
        this.errorCarga.set('No se pudieron cargar las misiones TypeScript.');
        this.cargando.set(false);
      }
    });
  }

  private resumirContenido(contenido: string): string {
    if (!contenido) return 'Completa esta misión de TypeScript.';
    const primeraOracion = contenido.trim().split(/(?<=[.!?])\s+/)[0];
    const resumen = primeraOracion || contenido.trim();
    return resumen.length > 90 ? `${resumen.slice(0, 90)}...` : resumen;
  }

  seleccionarMision(view: MisionViewTs): void {
    const mision = view.mision;
    if (!view.desbloqueada) return;

    const retoParaDashboard: any = {
      id_leccion: mision.id_leccion,
      id_nivel: mision.id_nivel,
      titulo: mision.titulo,
      contenido: mision.contenido,
      leccionContenido: mision.contenido,
      numero_nivel: mision.numero_nivel,
      estado: mision.estado
    };

    this.retoService.obtenerRetosDeLecciones([mision.id_leccion]).subscribe({
      next: retos => {
        const reto = retos[0] ?? null;
        if (reto) {
          retoParaDashboard.id_reto = reto.id_reto;
          retoParaDashboard.tipo_reto = reto.tipo_reto;
          retoParaDashboard.descripcion = reto.descripcion || mision.contenido;
        }
        this.missionSelected.emit(retoParaDashboard);
      },
      error: () => this.missionSelected.emit(retoParaDashboard)
    });
  }
}
