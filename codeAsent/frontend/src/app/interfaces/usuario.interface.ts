import { IProgreso } from './progreso.interface';

export interface IUsuario {
  id_usuario?: number;
  nombre: string;
  correo: string;
  rol?: 'jugador' | 'admin';
  fecha_registro?: string;
}

export interface NodeMapa {
  id: string;
  titulo: string;
  estado: 'unlocked' | 'current' | 'locked';
  subtexto: string;
  icono: string;
  posicion: { left: string; top: string };
}

export interface DashboardData {
  usuario: IUsuario;
  progreso: IProgreso;
  progresoSql?: IProgreso | null;
  logrosObtenidos: number;
  nodosMapa: NodeMapa[];
  perfil?: PerfilData;
  misiones: IMisionTS[];
}

export interface PerfilLenguaje {
  id_lenguaje: number;
  nombre: string;
  descripcion?: string;
  porcentaje: number;
  xp_actual: number;
  nivel_actual: number;
  total_niveles: number;
}

export interface PerfilData {
  lenguajes: PerfilLenguaje[];
  estadisticas: {
    nivelesCompletados: number;
    retosSuperados: number;
    xpTotal: number;
    precision: number;
  };
  actividadSemanal: Array<{ fecha: string; xp: number }>;
  logros: Array<{ id_logro: number; nombre: string; descripcion?: string; fecha_obtenido: string }>;
  logrosSql: Array<{ id_logro: number; nombre: string; descripcion?: string; xp_recompensa: number; requisito?: string; obtenido: boolean }>;
}

export interface IRespuestaMisionTS {
  id_respuesta: number;
  contenido: string;
  es_correcta: boolean;
}

export interface IRetoMisionTS {
  id_reto: number;
  titulo: string;
  descripcion: string;
  tipo_reto: 'opcion_multiple' | 'codigo' | 'verdadero_falso' | 'completar';
  xp_recompensa: number;
  dificultad: 'facil' | 'medio' | 'dificil';
  respuestas: IRespuestaMisionTS[];
}

export interface ILeccionMisionTS {
  id_leccion: number;
  titulo: string;
  contenido: string;
}

export interface IMisionTS {
  id_nivel: number;
  numero_nivel: number;
  nombre: string;
  descripcion: string;
  xp_requerida: number;

  leccion: ILeccionMisionTS | null;

  reto: IRetoMisionTS | null;
}