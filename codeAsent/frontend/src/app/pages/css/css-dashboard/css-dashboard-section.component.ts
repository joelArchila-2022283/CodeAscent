import { Component, EventEmitter, Output } from '@angular/core';
import type { CSSSection } from './css-dashboard.component';

@Component({
  selector: 'app-css-dashboard-section',
  standalone: true,
  templateUrl: './css-dashboard-section.component.html',
  styleUrl: './css-dashboard-section.component.scss'
})
export class CssDashboardSectionComponent {
  @Output() sectionSelected = new EventEmitter<CSSSection>();

  open(section: CSSSection): void {
    this.sectionSelected.emit(section);
  }
}
