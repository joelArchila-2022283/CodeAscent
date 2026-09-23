import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CssDataService, CssHint, CssMision } from '../../../services/css-data.service';
import { NivelCss, RetoCss } from '../../../interfaces/css.interface';

@Component({
  selector: 'app-css-terminal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './css-terminal.component.html',
  styleUrl: './css-terminal.component.scss'
})
export class CssTerminalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mission: CssMision | null = null;
  @Output() back = new EventEmitter<void>();
  @Output() continueToQuiz = new EventEmitter<void>();

  private cssData = inject(CssDataService);

  levels: NivelCss[] = [];
  taskIndex = signal(0);
  stars = signal(3);
  success = signal<boolean | null>(null);
  loading = signal(true);
  validating = signal(false);
  error = signal<string | null>(null);
  consoleText = signal('> Cargando misiones CSS desde PostgreSQL...');
  code = '';
  hints = signal<CssHint[]>([]);
  visibleHints = signal(0);

  ngOnInit(): void {
    this.loading.set(false);
    this.loadMission();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mission']) this.loadMission();
  }

  private loadMission(): void {
    if (this.mission) {
      this.levels = [this.mission.nivel];
      this.taskIndex.set(0);
      this.code = '';
      this.success.set(null);
      this.hints.set([]);
      this.visibleHints.set(0);
      this.consoleText.set(`> Nivel ${this.mission.nivel.numero_nivel}: ${this.mission.nivel.nombre}\n> Misión CSS preparada.`);
      if (this.mission.leccion?.id_leccion) {
        this.cssData.obtenerPistas(this.mission.leccion.id_leccion).subscribe(hints => this.hints.set(hints));
      }
    }
  }

  mostrarPista(): void {
    this.visibleHints.update(valor => Math.min(valor + 1, this.hints().length));
    this.consoleText.set(`> Pista ${this.visibleHints()} consultada. Revisa el objetivo sin copiar la solución.`);
  }

  ngOnDestroy(): void {
    this.removePreviewStyles();
  }

  private cargarNiveles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cssData.obtenerNivelesPedagogicos().subscribe({
      next: (niveles: NivelCss[]) => {
        this.levels = niveles ?? [];
        this.loading.set(false);

        if (this.levels.length === 0) {
          this.error.set('El backend no devolvió niveles CSS.');
          this.consoleText.set('> No se encontraron niveles CSS en PostgreSQL.');
          return;
        }

        this.load(this.levels[0]?.numero_nivel ?? 1);
        this.consoleText.set(
          `> ${this.levels.length} niveles CSS cargados desde PostgreSQL.\n` +
          `> Misión CSS preparada.`
        );
      },
      error: (error) => {
        console.error('Error cargando niveles CSS:', error);
        this.loading.set(false);
        this.error.set('No se pudieron cargar las misiones CSS desde el backend.');
        this.consoleText.set('> ERROR: No se pudieron cargar las misiones CSS.');
      }
    });
  }

  currentLevel(): NivelCss | null {
    return this.levels[this.taskIndex()] ?? null;
  }

  currentTask(): RetoCss | null {
    return this.currentLevel()?.retos?.find((reto: RetoCss) => reto.tipo_reto === 'codigo') ?? null;
  }

  load(numeroNivel: number): void {
    if (!this.levels.length) return;

    const index = this.levels.findIndex((nivel: NivelCss) => nivel.numero_nivel === numeroNivel);
    this.taskIndex.set(index >= 0 ? index : 0);
    this.code = '';
    this.success.set(null);
    this.stars.set(3);
    this.removePreviewStyles();

    const nivel = this.currentLevel();
    const reto = this.currentTask();
    if (!nivel || !reto) {
      this.consoleText.set('> Este nivel no tiene una misión de código configurada.');
      return;
    }

    this.consoleText.set(
      `> Nivel ${nivel.numero_nivel}: ${nivel.nombre}\n` +
      `> Misión: ${reto.titulo}\n` +
      '> Datos cargados desde PostgreSQL.'
    );
  }

  chooseTask(index: number): void {
    const nivel = this.levels[index];
    if (nivel) this.load(nivel.numero_nivel);
  }

  run(): void {
    const task = this.currentTask();

    if (!task) {
      this.consoleText.set('> No existe una misión de código para ejecutar.');
      return;
    }

    if (!this.code.trim()) {
      this.success.set(false);
      this.consoleText.set('> Escribe una regla CSS antes de ejecutar.');
      return;
    }

    // El preview se mantiene instantáneo, pero la validación real se hace en backend.
    this.applyPreview();
    this.validating.set(true);
    this.consoleText.set('> Validando misión en el servidor...');

    this.cssData.registrarIntentoCss(task.id_reto, this.code).subscribe({
      next: resultado => {
        this.validating.set(false);
        this.success.set(resultado.correcto);

        if (!resultado.correcto) {
          this.consoleText.set(
            '> El CSS se aplicó al preview, pero la misión todavía no coincide con la solución esperada.\n' +
            '> El intento fue registrado en PostgreSQL.'
          );
          return;
        }

        if (resultado.ya_completado) {
          this.consoleText.set(
            '> MISIÓN CORRECTA.\n' +
            '> CONTINÚA CON EL CUESTIONARIO.'
          );
        } else {
          this.consoleText.set(
            '> MISIÓN CSS VALIDADA.\n' +
            '> CONTINÚA CON EL CUESTIONARIO.'
          );
        }

      },
      error: error => {
        console.error('Error registrando intento CSS:', error);
        this.validating.set(false);
        this.success.set(null);
        this.consoleText.set('> ERROR: No se pudo guardar el intento en PostgreSQL.');
      }
    });
  }

  irAlCuestionario(): void {
    if (this.success()) this.continueToQuiz.emit();
  }

  reset(): void {
    this.code = '';
    this.success.set(null);
    this.removePreviewStyles();
    this.consoleText.set('> Editor reiniciado.');
  }

  private applyPreview(): void {
    this.removePreviewStyles();
    const style = document.createElement('style');
    style.id = 'codeascent-css-live-style';
    style.textContent = this.scopePreviewCss(this.code);
    document.head.appendChild(style);
  }

  private scopePreviewCss(css: string): string {
    return css.replace(
      /(^|})\s*([^@}{][^{]*)\{/g,
      (_match, closing, selectors) =>
        `${closing}\n${selectors.split(',').map((selector: string) => `.css-live-demo ${selector.trim()}`).join(', ')} {`
    );
  }

  private removePreviewStyles(): void {
    document.getElementById('codeascent-css-live-style')?.remove();
  }
}
