import { RowDataPacket } from 'mysql2';

export interface ILeccion {
    id_leccion?: number;
    id_nivel: number;
    titulo: string;
    contenido: string;
    orden: number;
    estado?: boolean;
}

export interface ILeccionRow extends RowDataPacket, ILeccion {}