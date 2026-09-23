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
      nombre: 'CUEVA ANTIGUA',
      lenguaje: 'HTML',
      estado: 'en_curso',
      posX: 52,
      posY: 56,
      ruta: '/curso/html',
      corte: 'polygon(42% 45%, 55% 42%, 68% 50%, 82% 45%, 100% 50%, 100% 100%, 48% 100%, 42% 88%, 46% 75%, 38% 60%)'
    },
    {
      id: 2,
      nombre: 'POBLADO ANTIGUO',
      lenguaje: 'CSS',
      estado: 'en_curso',
      posX: 84,
      posY: 38,
      ruta: '/curso/css',
      corte: 'polygon(55% 0%, 100% 0%, 100% 50%, 82% 45%, 68% 50%, 55% 42%, 42% 45%, 45% 38%, 52% 28%, 48% 20%)'
    },
    {
      id: 3,
      nombre: 'VALLE DE TRANSISTORES Y CABLES',
      lenguaje: 'SQL',
      estado: 'en_curso',
      posX: 22,
      posY: 75,
      ruta: '/curso/sql',
      corte: 'polygon(0% 45%, 15% 40%, 25% 48%, 35% 42%, 42% 45%, 38% 60%, 46% 75%, 42% 88%, 48% 100%, 0% 100%)'
    },
    {
      id: 4,
      nombre: 'VALLE DE TARJETA MADRE',
      lenguaje: 'TYPESCRIPT',
      estado: 'en_curso',
      posX: 24,
      posY: 38,
      ruta: '/curso/typescript',
      corte: 'polygon(0% 0%, 55% 0%, 48% 20%, 52% 28%, 45% 38%, 42% 45%, 35% 42%, 25% 48%, 15% 40%, 0% 45%)'
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
        
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar progreso del mapa:', err);
        this.cargando.set(false);
      }
    });
  }

  irATerritorio(territorio: PinTerritorio): void {
    if (territorio.estado !== 'bloqueado') {
      this.router.navigate([territorio.ruta]);
    }
  }
}

  /* 
     Cuando terminen las pruebas, reemplazaremos los territorios y métodos de arriba por estos:
  */

  /*
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
      nombre: 'CUEVA ANTIGUA',
      lenguaje: 'HTML',
      estado: 'en_curso',
      posX: 52,
      posY: 56,
      ruta: '/curso/html',
      corte: 'polygon(42% 45%, 55% 42%, 68% 50%, 82% 45%, 100% 50%, 100% 100%, 48% 100%, 42% 88%, 46% 75%, 38% 60%)'
    },
    {
      id: 2,
      nombre: 'POBLADO ANTIGUO',
      lenguaje: 'CSS',
      estado: 'bloqueado',
      posX: 84,
      posY: 38,
      ruta: '/curso/css',
      corte: 'polygon(55% 0%, 100% 0%, 100% 50%, 82% 45%, 68% 50%, 55% 42%, 42% 45%, 45% 38%, 52% 28%, 48% 20%)'
    },
    {
      id: 3,
      nombre: 'VALLE DE TRANSISTORES Y CABLES',
      lenguaje: 'SQL',
      estado: 'bloqueado',
      posX: 22,
      posY: 75,
      ruta: '/curso/sql',
      corte: 'polygon(0% 45%, 15% 40%, 25% 48%, 35% 42%, 42% 45%, 38% 60%, 46% 75%, 42% 88%, 48% 100%, 0% 100%)'
    },
    {
      id: 4,
      nombre: 'VALLE DE TARJETA MADRE',
      lenguaje: 'TYPESCRIPT',
      estado: 'bloqueado',
      posX: 24,
      posY: 38,
      ruta: '/curso/typescript',
      corte: 'polygon(0% 0%, 55% 0%, 48% 20%, 52% 28%, 45% 38%, 42% 45%, 35% 42%, 25% 48%, 15% 40%, 0% 45%)'
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
  */

