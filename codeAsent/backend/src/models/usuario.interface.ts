export interface IUsuario {
    id_usuario?: number;
    nombre: string;
    correo: string;
    password: string;
    rol?: 'jugador' | 'admin';
    fecha_registro?: Date;
}

export type IUsuarioRow = IUsuario;