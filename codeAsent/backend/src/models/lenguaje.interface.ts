import { RowDataPacket } from 'mysql2';

export interface ILenguaje {
    id_lenguaje?: number;
    nombre: string;
    descripcion?: string;
    estado?: boolean;
}

export interface ILenguajeRow extends RowDataPacket, ILenguaje {}