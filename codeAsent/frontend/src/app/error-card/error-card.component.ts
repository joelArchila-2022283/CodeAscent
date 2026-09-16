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
    this.router.navigate(['/login']);
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  retry(): void {
    window.location.reload();
  }

  report(): void {
    console.info('CodeAscent: reporte de error 500 solicitado.');
  }
}
