import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';

import {
    TsDataService,
    TodasLasLeccionesTS
} from '../../../services/ts-data.service';

@Component({
    selector: 'app-ts-data',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './TS-data.component.html',
    styleUrl: './TS-data.component.scss'
})
export class TSDataComponent implements OnInit {

    @Output() back = new EventEmitter<void>();

    private tsDataService = inject(TsDataService);

    cargando = signal<boolean>(true);
    errorCarga = signal<string | null>(null);

    lecciones = signal<TodasLasLeccionesTS[]>([]);

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(): void {
        this.cargando.set(true);
        this.errorCarga.set(null);

        this.tsDataService.obtenerTodasLasLecciones().subscribe({
            next: (datos) => {
                this.lecciones.set(datos);
                this.cargando.set(false);
            },

            error: (err) => {
                console.error(
                    'Error al cargar las lecciones TypeScript:',
                    err
                );

                this.errorCarga.set(
                    'No se pudieron cargar las lecciones de TypeScript.'
                );

                this.cargando.set(false);
            }
        });
    }

    cantidadLecciones(): number {
        return this.lecciones().reduce(
            (total, grupo) => total + grupo.lecciones.length,
            0
        );
    }
}