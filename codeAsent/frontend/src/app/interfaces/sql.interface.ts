export type SeccionSql = 'panel' | 'manual' | 'misiones' | 'consola' | 'evaluacion';

export interface RetoSql {
  id_reto: number;
  id_nivel?: number;
  titulo_reto: string;
  contexto_abp: string;
  esquema_bd: string;
  meta_resolver: string;
  xp_recompensa: number;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  pistas_disponibles: string[];
  respuestas_validas?: string[];
  ejemplos_visuales?: Array<{ titulo: string; codigo: string; explicacion?: string }>;
  manual_tecnico?: string;
  desbloqueado?: boolean;
  completado?: boolean;
  estado_progreso?: 'completada' | 'en_progreso' | 'bloqueada';
  nombre_nivel?: string;
}

export interface EsquemaTabla {
  nombre_tabla: string;
  descripcion_tabla: string;
  columnas: string[];
}

export interface PreguntaTestSql {
  id_pregunta: number;
  enunciado: string;
  opciones: string[];
  respuesta_correcta: number; 
}