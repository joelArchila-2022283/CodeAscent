export type SeccionSql = 'panel' | 'manual' | 'misiones' | 'consola' | 'cuestionario';

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

export interface MisionSql {
  idMision: string;
  codigoIdentificador: string;
  tituloMision: string;
  descripcionMision: string;
  recompensaExperiencia: number;
  estadoMision: 'bloqueada' | 'en_progreso' | 'completada';
  seccionDestino: SeccionSql;
  requisitoDesbloqueo: string;
}