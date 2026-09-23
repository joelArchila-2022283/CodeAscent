import { IUsuario } from './usuario.interface';

export interface PeticionLogin {
  correo: string;
  password: string;
}

export interface DatosAuth {
  token: string;
  usuario: IUsuario;
}

export interface RespuestaAuth {
  exito: boolean;
  mensaje: string;
  datos: DatosAuth;
}