import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../interfaces/usuario.interface';
import { PinTerritorio } from '../../interfaces/territorio.interface';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  cargando = signal<boolean>(true);
  datosDashboard = signal<DashboardData | null>(null);

  territorios = signal<PinTerritorio[]>([
    {
      id: 1,
      nombre: 'VALLE DE TARJETA MADRE',
      lenguaje: 'HTML',
      estado: 'en_curso',
      posX: 24,
      posY: 38,
      ruta: '/curso/html',
      corte: 'polygon(0% 0%, 48% 0%, 38% 52%, 0% 52%)'
    },
    {
      id: 2,
      nombre: 'CUEVA ANTIGUA',
      lenguaje: 'CSS',
      estado: 'bloqueado',
      posX: 22,
      posY: 75,
      ruta: '/curso/css',
      corte: 'polygon(0% 52%, 40% 52%, 46% 100%, 0% 100%)'
    },
    {
      id: 3,
      nombre: 'VALLE DE TRANSISTORES Y CABLES',
      lenguaje: 'SQL',
      estado: 'en_curso',
      posX: 52,
      posY: 56,
      ruta: '/curso/sql',
      corte: 'polygon(48% 0%, 68% 0%, 72% 100%, 46% 100%, 40% 52%)'
    },
    {
      id: 4,
      nombre: 'POBLADO ANTIGUO',
      lenguaje: 'TYPESCRIPT',
      estado: 'bloqueado',
      posX: 84,
      posY: 38,
      ruta: '/curso/typescript',
      corte: 'polygon(68% 0%, 100% 0%, 100% 100%, 72% 100%)'
    }
  ]);

  desbloqueadosCount = computed(() => {
    return this.territorios().filter(t => t.estado !== 'bloqueado').length;
  });

  ngOnInit(): void {
    this.obtenerProgreso();
  }

  obtenerProgreso(): void {
    this.cargando.set(true);
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: (data: any) => {
        this.datosDashboard.set(data);
        
        // Mapeo según la respuesta del backend (nodosMapa o progresoCursos)
        if (data?.nodosMapa) {
          this.territorios.update(lista =>
            lista.map(t => {
              const nodo = data.nodosMapa.find(
                (n: any) => n.titulo?.toLowerCase() === t.lenguaje.toLowerCase()
              );
              if (nodo) {
                let nuevoEstado: 'en_curso' | 'bloqueado' | 'completado' = 'bloqueado';
                if (nodo.estado === 'unlocked') {
                  nuevoEstado = 'completado';
                } else if (nodo.estado === 'current' || t.lenguaje === 'SQL') {
                  nuevoEstado = 'en_curso';
                }
                return { ...t, estado: nuevoEstado };
              }
              return t;
            })
          );
        } else if (data?.progresoCursos) {
          this.territorios.update(lista =>
            lista.map(t => {
              const infoCurso = data.progresoCursos.find(
                (c: any) => c.lenguaje.toLowerCase() === t.lenguaje.toLowerCase()
              );

              if (infoCurso) {
                return { ...t, estado: infoCurso.estado };
              }
              return t;
            })
          );
        }

        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar progreso del mapa:', err);
        this.cargando.set(false);
      }
    });
  }

  irATerritorio(territorio: PinTerritorio): void {
    if (territorio.estado !== 'bloqueado' || territorio.lenguaje === 'SQL') {
      this.router.navigate([territorio.ruta]);
    }
  }
}