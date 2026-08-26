import { RowDataPacket } from 'mysql2';

export interface IRespuesta {
    id_respuesta?: number;
    id_reto: number;
    contenido: string;
    es_correcta?: boolean;
}

export interface IRespuestaRow extends IRespuesta, RowDataPacket {}