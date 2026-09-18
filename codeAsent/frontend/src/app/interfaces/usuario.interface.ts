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
}