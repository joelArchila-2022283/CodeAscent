import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({ selector: 'app-html-test', standalone: true, imports: [CommonModule], templateUrl: './html-test.component.html', styleUrl: './html-test.component.scss' })
export class HtmlTestComponent {
  @Output() back = new EventEmitter<void>();
  selected = signal<number | null>(null);
  answered = signal(false);
  question = '¿Qué etiqueta contiene el contenido principal de una página?';
  options = ['<main>', '<head>', '<meta>', '<style>'];
  choose(index: number) { this.selected.set(index); this.answered.set(true); }
}
