import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({ selector: 'app-html-processes', standalone: true, imports: [CommonModule], templateUrl: './html-processes.component.html', styleUrl: './html-processes.component.scss' })
export class HtmlProcessesComponent {
  @Output() back = new EventEmitter<void>();
  completed = signal<number[]>([1]);
  missions = [{ id: 1, code: 'MIN-01', title: 'Abrir la compuerta', detail: 'Crea una página con un título y un párrafo.', reward: '+40 XP', icon: 'bi-door-open' }, { id: 2, code: 'MIN-02', title: 'Marcar el sendero', detail: 'Usa una lista para señalizar tres recursos.', reward: '+60 XP', icon: 'bi-signpost-2' }, { id: 3, code: 'MIN-03', title: 'Encender el HTML', detail: 'Añade una imagen con texto alternativo.', reward: '+80 XP', icon: 'bi-gem' }];
  toggleMission(id: number) { this.completed.update(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]); }
}
