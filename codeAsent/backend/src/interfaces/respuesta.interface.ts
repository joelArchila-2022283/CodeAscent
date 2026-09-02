export interface IRespuesta {
    id_respuesta?: number;
    id_reto: number;
    contenido: string;
    es_correcta?: boolean;
}

export type IRespuestaRow = IRespuesta;