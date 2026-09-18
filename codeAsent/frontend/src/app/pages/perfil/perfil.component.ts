import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData, PerfilLenguaje } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  cargando = signal(true);
  error = signal<string | null>(null);
  datos = signal<DashboardData | null>(null);

  ngOnInit(): void {
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: datos => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil del jugador.');
        this.cargando.set(false);
      }
    });
  }

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(parte => parte[0])
      .join('')
      .toUpperCase();
  }

  porcentajeLenguaje(lenguaje: PerfilLenguaje): number {
    return Math.max(0, Math.min(100, Number(lenguaje.porcentaje || 0)));
  }

  nombreCorto(nombre: string): string {
    return nombre.toLowerCase() === 'typescript' ? 'TYPESCRIPT' : nombre.toUpperCase();
  }

  iconoLenguaje(nombre: string): string {
    const iconos: Record<string, string> = {
      html: 'bi-filetype-html',
      css: 'bi-filetype-css',
      sql: 'bi-database-fill-gear',
      typescript: 'bi-filetype-tsx'
    };
    return iconos[nombre.toLowerCase()] || 'bi-code-slash';
  }

  claseLenguaje(nombre: string): string {
    return nombre.toLowerCase().replace('typescript', 'ts');
  }

  maxActividad(): number {
    const actividad = this.datos()?.perfil?.actividadSemanal || [];
    return Math.max(...actividad.map(item => Number(item.xp)), 1);
  }

  xpDelDia(indice: number): number {
    const actividad = this.datos()?.perfil?.actividadSemanal || [];
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (6 - indice));
    const clave = fecha.toISOString().slice(0, 10);
    return Number(actividad.find(item => item.fecha === clave)?.xp || 0);
  }

  etiquetaDia(indice: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (6 - indice));
    return fecha.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3).toUpperCase();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }
}
