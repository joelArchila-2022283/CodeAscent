import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

export type ErrorType = '404' | '500' | '403' | 'offline';

@Component({
  selector: 'app-error-card',
  standalone: true,
  templateUrl: './error-card.component.html',
  styleUrl: './error-card.component.css'
})
export class ErrorCardComponent {
  @Input({ required: true }) type: ErrorType = '404';

  constructor(private readonly router: Router) {}

  get accent(): string {
    return this.type === '403' ? 'var(--r)' : this.type === '500' ? 'var(--g)' : 'var(--c)';
  }

goHome(): void {
  void this.router.navigate(['/inicio']);
}

  goLogin(): void {
    this.router.navigate(['/login']);
  }

 retry(): void {

  if (this.type === 'offline') {

    if (navigator.onLine) {
      void this.router.navigate(['/inicio']);
      return;
    }

    console.warn('CodeAscent: todavía no hay conexión a Internet.');
    return;
  }

  if (this.type === '500') {
    void this.router.navigate(['/inicio']);
  }
}

  report(): void {
    console.info('CodeAscent: reporte de error 500 solicitado.');
  }
}
