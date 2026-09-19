export interface EjemploCss {
  id_ejemplo: number;
  titulo: string | null;
  codigo: string;
  explicacion: string | null;
}

export interface LeccionCss {
  id_leccion: number;
  titulo: string;
  contenido: string;
  orden: number;
  ejemplos: EjemploCss[];
}

export interface RespuestaCss {
  id_respuesta: number;
  contenido: string;
  es_correcta: boolean;
}

export interface RetoCss {
  id_reto: number;
  id_leccion: number;
  titulo: string;
  descripcion: string;
  tipo_reto: 'opcion_multiple' | 'codigo' | 'verdadero_falso' | 'completar';
  xp_recompensa: number;
  dificultad: 'facil' | 'medio' | 'dificil';
  respuestas: RespuestaCss[];
}

export interface NivelCss {
  id_nivel: number;
  id_lenguaje: number;
  nombre: string;
  numero_nivel: number;
  descripcion: string;
  xp_requerida: number;
  lecciones: LeccionCss[];
  retos: RetoCss[];
}
