import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeccionSql } from '../../../interfaces/sql.interface';

@Component({
  selector: 'app-panel-sql',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-sql.component.html',
  styleUrls: ['./panel-sql.component.scss']
})
export class PanelSqlComponent {
  @Output() navegarA = new EventEmitter<SeccionSql>();

  irA(seccion: SeccionSql): void {
    this.navegarA.emit(seccion);
  }
}