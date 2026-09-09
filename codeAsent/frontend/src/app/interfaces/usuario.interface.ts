export interface IUsuario {
  id_usuario?: number;
  nombre: string;
  correo: string;
  rol?: 'jugador' | 'admin';
  fecha_registro?: string;
}