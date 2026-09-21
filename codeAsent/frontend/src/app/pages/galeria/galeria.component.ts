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
            imagen: 'assets/images/comics/comic-01.jpeg',
            categoria: 'Parte 1',
            enracesExterno: '/comic/1'
        },
        {
            titulo: 'Ataque',
            descripcion: 'Inicio de la invasion',
            imagen: 'assets/images/comics/comic-02.jpeg',
            categoria: 'Parte 1',
            enracesExterno: '/comic/2'
        },
        {
            titulo: 'Inicio de la aventura',
            descripcion: 'Adentrandos en el bosque',
            imagen: 'assets/images/comics/comic-03.jpeg',
            categoria: 'Parte 1',
            enracesExterno: '/comic/3'
        },
        {
            titulo: 'Encontrando el poder',
            descripcion: 'Un libro lleno de conocimiento',
            imagen: 'assets/images/comics/comic-04.jpeg',
            categoria: 'Parte 1',
            enracesExterno: '/comic/4'
        },
        {
            titulo: 'La gema brillante',
            descripcion: 'Un poder hambriento',
            imagen: 'assets/images/comics/comic-05.jpeg',
            categoria: 'Parte 2',
            enracesExterno: '/comic/5'
        },
        {
            titulo: 'La aldea abandonada',
            descripcion: 'Primer paso de vuelta a casa',
            imagen: 'assets/images/comics/comic-06.jpeg',
            categoria: 'Parte 2',
            enracesExterno: '/comic/6'
        },
        {
            titulo: 'El malware',
            descripcion: 'El villano se muestra',
            imagen: 'assets/images/comics/comic-07.jpeg',
            categoria: 'Parte 2',
            enracesExterno: '/comic/7'
        },
        {
            titulo: 'Tu poder siempre fue tuyo',
            descripcion: 'Tu poder no lo alberga un libro...',
            imagen: 'assets/images/comics/comic-08.jpeg',
            categoria: 'Parte 3',
            enracesExterno: '/comic/8'
        },
        {
            titulo: 'Antivirus',
            descripcion: 'Tu programacion no define si ganas',
            imagen: 'assets/images/comics/comic-09.jpeg',
            categoria: 'Parte 3',
            enracesExterno: '/comic/9'
        },
        {
            titulo: 'Rompe tu programacion',
            descripcion: 'El malware fue derrotado',
            imagen: 'assets/images/comics/comic-10.jpeg',
            categoria: 'Parte 3',
            enracesExterno: '/comic/10'
        },
        {
            titulo: 'Pelea final',
            descripcion: 'El heroe se enfrenta al malware',
            imagen: 'assets/images/comics/comic-11.jpeg',
            categoria: 'Parte 3',
            enracesExterno: '/comic/10'
        },
        {
            titulo: 'Rompe tu programacion',
            descripcion: 'El malware fue derrotado',
            imagen: 'assets/images/comics/comic-10.jpeg',
            categoria: 'Parte 3',
            enracesExterno: '/comic/11'
        }
    ];
}