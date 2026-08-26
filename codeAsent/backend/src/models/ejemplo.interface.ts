import { RowDataPacket } from 'mysql2';

export interface IEjemplo {
    id_ejemplo?: number;
    id_leccion: number;
    titulo?: string;
    codigo: string;
    explicacion?: string;
}

export interface IEjemploRow extends RowDataPacket, IEjemplo {}