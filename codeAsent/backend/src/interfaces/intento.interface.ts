export interface IIntento {
    id_intento?: number;
    id_usuario: number;
    id_reto: number;
    respuesta_usuario?: string;
    correcto: boolean;
    xp_obtenida?: number;
    fecha_intento?: Date;
}

export type IIntentoRow = IIntento;