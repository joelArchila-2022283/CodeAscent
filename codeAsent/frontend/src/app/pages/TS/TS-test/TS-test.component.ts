import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-ts-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './TS-test.component.html',
  styleUrl: './TS-test.component.scss'
})
export class TSTestComponent {

  @Output() back = new EventEmitter<void>();

  selected = signal<number | null>(null);

  answered = signal(false);

  question =
    '¿Cuál de las siguientes opciones define correctamente una variable numérica en TypeScript?';

  options = [
    'const nivel: number = 5;',
    'const nivel: string = 5;',
    'const nivel: boolean = 5;',
    'const nivel: number = "5";'
  ];

  choose(index: number): void {
    this.selected.set(index);
    this.answered.set(true);
  }
}