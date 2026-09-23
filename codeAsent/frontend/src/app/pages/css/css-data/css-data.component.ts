import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal, inject } from '@angular/core';
import { CssDataService, CssMision } from '../../../services/css-data.service';

@Component({ selector:'app-css-data', standalone:true, templateUrl:'./css-data.component.html', styleUrl:'./css-data.component.scss' })
export class CssDataComponent implements OnInit, OnChanges {
  @Input() mission: CssMision | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  private cssData = inject(CssDataService);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    if (this.mission) {
        this.loading.set(false);
        return;
    }
    this.cssData.obtenerMisionesCss().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.error.set('No se pudieron cargar los niveles CSS desde la base de datos.');
        this.loading.set(false);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission']) this.loading.set(!this.mission);
  }
}
