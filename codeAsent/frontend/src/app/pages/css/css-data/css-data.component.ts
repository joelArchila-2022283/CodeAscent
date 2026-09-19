import { Component, EventEmitter, Output, OnInit, signal, inject } from '@angular/core';
import { CssDataService } from '../../../services/css-data.service';
import { NivelCss } from '../../../interfaces/css.interface';

@Component({ selector:'app-css-data', standalone:true, templateUrl:'./css-data.component.html', styleUrl:'./css-data.component.scss' })
export class CssDataComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  @Output() practice = new EventEmitter<number>();
  private cssData = inject(CssDataService);
  levels: NivelCss[] = [];
  activeLevel = signal(1);
  loading = signal(true);
  error = signal('');
  ngOnInit(): void { this.cssData.obtenerNivelesPedagogicos().subscribe({ next: levels => { this.levels=levels; if(levels.length) this.activeLevel.set(levels[0].numero_nivel); this.loading.set(false); }, error: () => { this.error.set('No se pudieron cargar los niveles CSS desde la base de datos.'); this.loading.set(false); } }); }
  select(id:number){ this.activeLevel.set(id); }
  current(): NivelCss | null { return this.levels.find((l: NivelCss)=>l.numero_nivel===this.activeLevel()) ?? this.levels[0] ?? null; }
}
