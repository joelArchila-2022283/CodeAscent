export interface ILenguaje {
    id_lenguaje?: number;
    nombre: string;
    descripcion?: string;
    estado?: boolean;
}

export type ILenguajeRow = ILenguaje;