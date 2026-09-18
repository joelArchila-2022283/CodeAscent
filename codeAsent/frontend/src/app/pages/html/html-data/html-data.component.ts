import { Component, EventEmitter, Output } from '@angular/core';

@Component({ selector: 'app-html-data', standalone: true, templateUrl: './html-data.component.html', styleUrl: './html-data.component.scss' })
export class HtmlDataComponent { @Output() back = new EventEmitter<void>(); }
