export type SeccionSql = 'panel' | 'manual' | 'misiones' | 'consola' | 'cuestionario';

export interface EjemploNivelSql {
  id_ejemplo: number;
  titulo?: string;
  codigo: string;
  explicacion?: string;
}

export interface LeccionNivelSql {
  id_leccion: number;
  titulo: string;
  contenido: string;
  orden: number;
  ejemplos: EjemploNivelSql[];
}

export interface RespuestaNivelSql {
  id_respuesta: number;
  contenido: string;
  es_correcta: boolean;
}

export interface RetoNivelSql {
  id_reto: number;
  id_leccion: number;
  titulo: string;
  descripcion: string;
  tipo_reto: 'opcion_multiple' | 'codigo' | 'verdadero_falso' | 'completar';
  xp_recompensa: number;
  dificultad: 'facil' | 'medio' | 'dificil';
  respuestas: RespuestaNivelSql[];
}

export interface NivelSql {
  id_nivel: number;
  id_lenguaje: number;
  nombre: string;
  numero_nivel: number;
  descripcion?: string;
  xp_requerida?: number;
  lecciones: LeccionNivelSql[];
  retos: RetoNivelSql[];
}

export interface JugadorSql {
  nombreJugador: string;
  tituloRango: string;
  nivelProgreso: number;
  experienciaActual: number;
  experienciaSiguienteNivel: number;
  transistoresActivos: number;
  totalTransistores: number;
  estrellasTotales: number;
}

export interface PistaSql {
  nivelPista: number; // 1: Conceptual, 2: Orientativa, 3: Específica, 4: Casi solución
  textoExplicativo: string;
  penalizacionEstrellas: number;
}

export interface DesafioConsolaSql {
  idDesafio: string;
  codigoIdentificador: string;
  tituloDesafio: string;
  planteamientoProblema: string;
  preguntaRazonamiento: string;
  opcionesPrediccion: string[];
  indicePrediccionCorrecta: number;
  pistasAndamiaje: PistaSql[];
  consultaSqlCorrecta: string;
  retroalimentacionExito: string;
  explicacionErrorSintaxis: string;
}