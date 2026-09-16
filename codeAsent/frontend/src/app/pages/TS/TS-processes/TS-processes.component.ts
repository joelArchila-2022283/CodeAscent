import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-ts-processes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-processes.component.html',
  styleUrl: './TS-processes.component.scss'
})
export class TSProcessesComponent {

  @Output() back = new EventEmitter<void>();

  completed = signal<number[]>([1]);

  missions = [
    {
      id: 1,
      code: 'TS-01',
      title: 'Declarar variables',
      detail: 'Crea variables usando tipos string, number y boolean.',
      reward: '+40 XP',
      icon: 'bi-braces'
    },
    {
      id: 2,
      code: 'TS-02',
      title: 'Definir una interfaz',
      detail: 'Construye una interfaz para describir los datos de un jugador.',
      reward: '+60 XP',
      icon: 'bi-diagram-3'
    },
    {
      id: 3,
      code: 'TS-03',
      title: 'Ejecutar una función',
      detail: 'Crea una función tipada que reciba datos y devuelva un resultado.',
      reward: '+80 XP',
      icon: 'bi-cpu'
    }
  ];

  toggleMission(id: number): void {
    this.completed.update(items =>
      items.includes(id)
        ? items.filter(item => item !== id)
        : [...items, id]
    );
  }
}