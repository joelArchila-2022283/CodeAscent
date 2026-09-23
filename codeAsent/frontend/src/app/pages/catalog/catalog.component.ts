import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { IMission } from '../../core/models/language.model';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="catalog-container">
      <h1>Misiones de {{ langSlug | uppercase }}</h1>
      <div class="grid">
        <div *ngFor="let m of missions()" class="mission-card" [class.locked]="m.estado === 'locked'">
          <h3>{{ m.titulo }}</h3>
          <p>{{ m.contenido }}</p>
          <span>{{ m.estado === 'completed' ? 'Completada' : m.estado === 'locked' ? 'Bloqueada' : 'Disponible' }}</span>
          <a *ngIf="m.estado !== 'locked'" [routerLink]="['/', langSlug, 'missions', m.id_leccion, 'manual']">Abrir misión</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container { min-height: 100vh; padding: 3rem 1.5rem; background: var(--rock-dark); color: var(--text-html); }
    h1 { max-width: 1100px; margin: 0 auto 2rem; color: var(--amber-glow); font-family: 'Bangers', cursive; letter-spacing: .06em; }
    .grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .mission-card { display: flex; flex-direction: column; gap: .7rem; padding: 1.25rem; background: var(--rock-panel); border: 2px solid var(--rock-border); border-radius: 12px; }
    .mission-card h3 { color: var(--cyan-screen); margin: 0; }
    .mission-card p { color: var(--text-dim); flex: 1; }
    .mission-card a { align-self: flex-start; padding: .55rem .8rem; border-radius: 8px; background: var(--amber-fire); color: #120b00; text-decoration: none; font-weight: 700; }
    .mission-card.locked { opacity: .55; filter: grayscale(.7); }
  `]
})
export class CatalogComponent implements OnInit {
  langSlug = '';
  missions = signal<IMission[]>([]);
  private readonly route = inject(ActivatedRoute);
  private readonly langService = inject(LanguageService);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.langSlug = params['lang'];
      this.langService.obtenerMisionesPorSlug(this.langSlug).subscribe(res => {
        this.missions.set(res.data);
      });
    });
  }
}
