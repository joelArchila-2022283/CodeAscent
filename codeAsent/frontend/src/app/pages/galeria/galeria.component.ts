import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ElementoGaleria {
    titulo: string;
    descripcion: string;
    imagen: string;
    categoria: string;
    enracesExterno: string;
}

@Component({
    selector: 'app-galeria',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './galeria.component.html',
    styleUrls: ['./galeria.component.scss']
})
export class GaleriaComponent {
    elementosGaleria: ElementoGaleria[] = [
    {
        titulo: 'Introduccion',
        descripcion: 'La vida de alguien que cree ser obsoleto',
        imagen: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
        categoria: 'Parte 1',
        enracesExterno: '/comic/1'
    },
    {
        titulo: 'Repositorio de Malware',
        descripcion: 'Análisis detallado de códigos maliciosos de tinta y métodos de contención.',
        imagen: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
        categoria: 'SEGURIDAD',
        enracesExterno: 'https://stackoverflow.com'
    },
    {
        titulo: 'Simulador de Nodos',
        descripcion: 'Herramienta externa de pruebas de estrés para verificar la estabilidad del servidor.',
        imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        categoria: 'HERRAMIENTA',
        enracesExterno: 'https://angular.io'
    }
    ];
}