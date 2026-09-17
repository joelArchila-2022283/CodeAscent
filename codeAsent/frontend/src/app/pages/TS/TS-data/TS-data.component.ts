import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';

import { TsDataService, ResumenTSData } from '../../../services/ts-data.service';

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
    resumen = signal<ResumenTSData | null>(null);

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(): void {
        this.cargando.set(true);
        this.errorCarga.set(null);

        this.tsDataService.obtenerResumen().subscribe({
            next: (datos) => {
                this.resumen.set(datos);
                this.cargando.set(false);
            },
            error: (err) => {
                console.error('Error al cargar datos del sector TypeScript:', err);
                this.errorCarga.set('No se pudieron cargar los datos del sector TypeScript.');
                this.cargando.set(false);
            }
        });
    }

    formatearFecha(fecha: string | Date | null | undefined): string {
        if (!fecha) {
            return 'Sin registros aún';
        }
        const f = new Date(fecha);
        if (isNaN(f.getTime())) {
            return 'Sin registros aún';
        }
        return f.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}