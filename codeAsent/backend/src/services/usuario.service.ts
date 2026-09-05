import { IUsuario } from '../interfaces/usuario.interface';
import { ModeloUsuario } from '../models/usuario.model';
import * as bcrypt from 'bcryptjs';
import { generarToken } from '../utils/jwt.util';

export class UsuarioService {

    static async iniciarSesion(
    correo: string,
    contrasenaIngresada: string
): Promise<{ token: string; usuario: Partial<IUsuario> } | null> {

    const usuario = await ModeloUsuario.obtenerPorCorreo(correo);

    if (!usuario || !usuario.password) {
        return null;
    }

    const contrasenaValida = await bcrypt.compare(
        contrasenaIngresada,
        usuario.password
    );

    if (!contrasenaValida) {
        return null;
    }

    const token = generarToken({
        id_usuario: usuario.id_usuario!,
        correo: usuario.correo,
        rol: usuario.rol ?? 'jugador'
    });

    const { password, ...usuarioSinPassword } = usuario;

    return {
        token,
        usuario: usuarioSinPassword
    };
}


    static async obtenerTodos(): Promise<IUsuario[]> {
        return await ModeloUsuario.obtenerTodos();
    }

    static async obtenerPorId(id_usuario: number): Promise<IUsuario | null> {
        return await ModeloUsuario.obtenerPorId(id_usuario);
    }

    static async obtenerPorCorreo(correo: string): Promise<IUsuario | null> {
        return await ModeloUsuario.obtenerPorCorreo(correo);
    }

    static async crear(datosUsuario: IUsuario): Promise<IUsuario> {

        const usuarioExistente = await ModeloUsuario.obtenerPorCorreo(
            datosUsuario.correo
        );

        if (usuarioExistente) {
            throw new Error('El correo ya está registrado');
        }

        return await ModeloUsuario.crear(datosUsuario);
    }

    static async actualizar(
        id_usuario: number,
        datosUsuario: Partial<IUsuario>
    ): Promise<boolean> {

        const usuario = await ModeloUsuario.obtenerPorId(id_usuario);

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return await ModeloUsuario.actualizar(
            id_usuario,
            datosUsuario
        );
    }

    static async eliminar(id_usuario: number): Promise<boolean> {

        const usuario = await ModeloUsuario.obtenerPorId(id_usuario);

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return await ModeloUsuario.eliminar(id_usuario);
    }
}