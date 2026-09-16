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
  logrosObtenidos: number;
  nodosMapa: NodeMapa[];
}