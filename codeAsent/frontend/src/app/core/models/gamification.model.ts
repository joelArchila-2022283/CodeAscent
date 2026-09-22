export interface IGamificationData {
  xpTotal: number;
  porcentaje?: number;
  nivelActual: {
    id_nivel: number;
    nombre: string;
    numero_nivel: number;
    xp_requerida: number;
  } | null;
  logros: Array<{
    id_logro: number;
    codigo: string;
    titulo: string;
    descripcion: string;
    dificultad: string;
    obtenido: boolean;
  }>;
}
