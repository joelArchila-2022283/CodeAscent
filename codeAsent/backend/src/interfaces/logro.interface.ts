export interface Logro {
  id_logro?: number;
  nombre: string;
  descripcion: string | null;
  xp_recompensa: number;
  requisito: string | null;
  estado: boolean;
}

export type LogroRow = Logro;