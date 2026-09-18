import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorCardComponent, ErrorType } from '../error-card/error-card.component';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [ErrorCardComponent],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css'
})
export class ErrorPageComponent implements OnInit {

  type: ErrorType = '500';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const routeType = this.route.snapshot.paramMap.get('type');

    if (
      routeType === '404' ||
      routeType === '403' ||
      routeType === '500' ||
      routeType === 'offline'
    ) {
      this.type = routeType;
    }
  }
}