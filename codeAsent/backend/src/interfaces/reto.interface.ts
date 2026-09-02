export type TipoReto = 'opcion_multiple' | 'codigo' | 'verdadero_falso' | 'completar';
export type DificultadReto = 'facil' | 'medio' | 'dificil';

export interface IReto {
    id_reto?: number;
    id_leccion: number;
    titulo: string;
    descripcion: string;
    tipo_reto: TipoReto;
    xp_recompensa?: number;
    dificultad?: DificultadReto;
    estado?: boolean;
}

export type IRetoRow = IReto;