import { Component } from '@angular/core';
import { ErrorCardComponent } from '../error-card/error-card.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ErrorCardComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {}
