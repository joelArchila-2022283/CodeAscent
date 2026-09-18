import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-css-processes',
  standalone: true,
  templateUrl: './css-processes.component.html',
  styleUrl: './css-processes.component.scss'
})
export class CssProcessesComponent {
  @Output() back = new EventEmitter<void>();
  @Output() openTerminal = new EventEmitter<void>();
}
