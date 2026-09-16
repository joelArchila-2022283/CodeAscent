import { Component, EventEmitter, Output } from '@angular/core';

export type HTMLSection = 'dashboard' | 'data' | 'processes' | 'terminal' | 'test';

@Component({
  selector: 'app-html-dashboard-section',
  standalone: true,
  templateUrl: './html-dashboard-section.component.html',
  styleUrl: './html-dashboard.component.scss'
})
export class HtmlDashboardSectionComponent {
  @Output() sectionSelected = new EventEmitter<HTMLSection>();

  selectSection(section: HTMLSection) {
    this.sectionSelected.emit(section);
  }
}
