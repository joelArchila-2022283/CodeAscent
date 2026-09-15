import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NodeMapa {
  titulo: string;
  estado: 'unlocked' | 'current' | 'locked';
  subtexto: string;
  icono: string;
  posicion: { left: string; top: string };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  usuario = signal({
    nombre: 'Joel',
    nivel: 7,
    estado: 'Proceso Activo',
    puntosXP: 2450,
    fragmentosDatos: 380,
    progresoNivel: 68
  });

  nodosMapa = signal<NodeMapa[]>([
    { titulo: 'HTML', estado: 'unlocked', subtexto: 'Completado', icono: 'bi-filetype-html', posicion: { left: '8%', top: '78%' } },
    { titulo: 'CSS', estado: 'current', subtexto: 'En progreso', icono: 'bi-filetype-css', posicion: { left: '38%', top: '64%' } },
    { titulo: 'SQL', estado: 'locked', subtexto: 'Bloqueado', icono: 'bi-lock-fill', posicion: { left: '62%', top: '64%' } },
    { titulo: 'TypeScript', estado: 'locked', subtexto: 'Bloqueado', icono: 'bi-lock-fill', posicion: { left: '90%', top: '42%' } }
  ]);
}