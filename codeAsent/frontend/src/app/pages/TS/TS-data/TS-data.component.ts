import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-ts-data',
    standalone: true,
    templateUrl: './TS-data.component.html',
    styleUrl: './TS-data.component.scss'
})
export class TSDataComponent {
    @Output() back = new EventEmitter<void>();
}