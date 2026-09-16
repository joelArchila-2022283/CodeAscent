import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({ selector: 'app-html-terminal', standalone: true, imports: [FormsModule], templateUrl: './html-terminal.component.html', styleUrl: './html-terminal.component.scss' })
export class HtmlTerminalComponent {
  @Output() back = new EventEmitter<void>();
  code = signal('<h1>Hola, HTML</h1>\n<p>Mi primera expedición web.</p>');
  saved = signal(false);
  render() { this.saved.set(true); }
}
