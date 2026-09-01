export interface IEjemplo {
    id_ejemplo?: number;
    id_leccion: number;
    titulo?: string;
    codigo: string;
    explicacion?: string;
}

export type IEjemploRow = IEjemplo;