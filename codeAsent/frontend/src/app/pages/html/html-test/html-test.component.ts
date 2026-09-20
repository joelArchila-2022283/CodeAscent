import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';

@Component({ selector: 'app-html-test', standalone: true, imports: [CommonModule], templateUrl: './html-test.component.html', styleUrl: './html-test.component.scss' })
export class HtmlTestComponent implements OnChanges {
  @Input() retoPrediccion: any = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  selected = signal<number | null>(null);
  answered = signal(false);
  isCorrect = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['retoPrediccion']) {
      this.selected.set(null);
      this.answered.set(false);
      this.isCorrect.set(false);
    }
  }

  choose(index: number, correcta: boolean) { 
    if (this.answered()) return;
    this.selected.set(index); 
    this.answered.set(true); 
    this.isCorrect.set(correcta);
  }
}