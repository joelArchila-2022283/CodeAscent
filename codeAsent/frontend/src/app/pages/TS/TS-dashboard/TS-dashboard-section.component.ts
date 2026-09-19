import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { IMisionTS } from '../../../interfaces/usuario.interface';

export type TSSection =
  | 'dashboard'
  | 'data'
  | 'processes'
  | 'terminal'
  | 'test';

@Component({
  selector: 'app-ts-dashboard-section',
  standalone: true,

  templateUrl:
    './TS-dashboard-section.component.html',

  styleUrl:
    './TS-dashboard.component.scss'
})
export class TSDashboardSectionComponent {

  @Input()
  misiones: IMisionTS[] = [];

  @Output()
  sectionSelected =
    new EventEmitter<TSSection>();

  selectSection(
    section: TSSection
  ): void {

    this.sectionSelected.emit(section);
  }
}