export interface ILeccion {
    id_leccion?: number;
    id_nivel: number;
    titulo: string;
    contenido: string;
    orden: number;
    estado?: boolean;
}

export type ILeccionRow = ILeccion;