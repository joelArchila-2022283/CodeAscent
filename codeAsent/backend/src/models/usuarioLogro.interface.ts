export interface IUsuarioLogro {
    id_usuario_logro?: number;
    id_usuario: number;
    id_logro: number;
    fecha_obtenido?: Date;
}

export interface IUsuarioLogroDetalle extends IUsuarioLogro {
    nombre_logro?: string;
    descripcion_logro?: string;
    xp_recompensa?: number;
}

export type IUsuarioLogroRow = IUsuarioLogro;
export type IUsuarioLogroDetalleRow = IUsuarioLogroDetalle;