import { RowDataPacket } from 'mysql2';

export interface INivelUsuario {
    id_nivel_usuario?: number;
    id_usuario: number;
    id_nivel: number;
    desbloqueado?: boolean;
    completado?: boolean;
    fecha_desbloqueo?: Date | string | null;
    fecha_completado?: Date | string | null;
}

export interface INivelUsuarioRow extends INivelUsuario, RowDataPacket {}