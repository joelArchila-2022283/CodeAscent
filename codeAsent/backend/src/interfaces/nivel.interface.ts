export interface INivel {
    id_nivel?: number;
    id_lenguaje: number;
    nombre: string;
    numero_nivel: number;
    descripcion?: string;
    xp_requerida?: number;
    estado?: boolean;
}

export type INivelRow = INivel;