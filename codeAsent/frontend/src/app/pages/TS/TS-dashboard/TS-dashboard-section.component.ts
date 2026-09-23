import { Component, EventEmitter, Output } from '@angular/core';

export type TSSection = 'dashboard' | 'data' | 'processes' | 'terminal' | 'test';

@Component({
  selector: 'app-ts-dashboard-section',
  standalone: true,
  templateUrl: './TS-dashboard-section.component.html',
  styleUrl: './TS-dashboard.component.scss'
})
export class TSDashboardSectionComponent {
  @Output() sectionSelected = new EventEmitter<TSSection>();

  selectSection(section: TSSection) {
    this.sectionSelected.emit(section);
  }
}
