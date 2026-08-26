import { ModeloUsuarioLogro } from '../models/usuarioLogro.model';
import { IUsuarioLogro, IUsuarioLogroDetalle } from '../models/usuarioLogro.interface';

export class ServicioUsuarioLogro {

    static async obtenerTodos(): Promise<IUsuarioLogro[]> {
        return await ModeloUsuarioLogro.obtenerTodos();
    }

    static async obtenerPorId(id_usuario_logro: number): Promise<IUsuarioLogro> {
        const registro = await ModeloUsuarioLogro.obtenerPorId(id_usuario_logro);
        if (!registro) {
            throw new Error(`El registro de logro asignado con ID ${id_usuario_logro} no existe.`);
        }
        return registro;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IUsuarioLogroDetalle[]> {
        if (!id_usuario || id_usuario <= 0) {
            throw new Error('El ID de usuario debe ser un número entero positivo válido.');
        }
        return await ModeloUsuarioLogro.obtenerPorUsuario(id_usuario);
    }

    static async asignarLogro(id_usuario: number, id_logro: number): Promise<IUsuarioLogro> {
        if (!id_usuario || !id_logro) {
            throw new Error('Los campos id_usuario e id_logro son obligatorios.');
        }

        const yaPoseeLogro = await ModeloUsuarioLogro.verificarExiste(id_usuario, id_logro);
        if (yaPoseeLogro) {
            throw new Error(`El usuario con ID ${id_usuario} ya posee desbloqueado el logro con ID ${id_logro}.`);
        }

        return await ModeloUsuarioLogro.asignarLogro(id_usuario, id_logro);
    }

    static async eliminar(id_usuario_logro: number): Promise<boolean> {
        await this.obtenerPorId(id_usuario_logro);
        return await ModeloUsuarioLogro.eliminar(id_usuario_logro);
    }
}