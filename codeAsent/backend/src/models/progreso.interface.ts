import { RowDataPacket } from 'mysql2';

export interface IProgreso {
    id_progreso?: number;
    id_usuario: number;
    id_lenguaje: number;
    id_nivel_actual?: number | null;
    xp_actual?: number;
    porcentaje?: number;
    fecha_actualizacion?: Date;
}

export interface IProgresoRow extends RowDataPacket, IProgreso {}