import { pool } from '../config/conexion';
import { IUsuario, IUsuarioRow } from '../interfaces/usuario.interface';

export class ModeloUsuario {

    static async obtenerTodos(): Promise<IUsuario[]> {
        const resultado = await pool.query<IUsuarioRow>(
            'SELECT * FROM fn_obtener_usuarios()'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_usuario: number): Promise<IUsuario | null> {
        const resultado = await pool.query<IUsuarioRow>(
            'SELECT * FROM fn_obtener_usuario_por_id($1)',
            [id_usuario]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorCorreo(correo: string): Promise<IUsuario | null> {
        const resultado = await pool.query<IUsuarioRow>(
            'SELECT * FROM fn_obtener_usuarios() WHERE correo = $1',
            [correo]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async crear(datosUsuario: IUsuario): Promise<boolean> {
        const { nombre, correo, password, rol } = datosUsuario;
        await pool.query(
            'CALL sp_crear_usuario($1, $2, $3, $4)',
            [nombre, correo, password, rol || 'jugador']
        );
        return true;
    }

    static async actualizar(
        id_usuario: number,
        datosUsuario: Partial<IUsuario>
    ): Promise<boolean> {
        const actual = await this.obtenerPorId(id_usuario);
        if (!actual) return false;

        const nombre = datosUsuario.nombre ?? actual.nombre;
        const correo = datosUsuario.correo ?? actual.correo;
        const password = datosUsuario.password ?? actual.password;
        const rol = datosUsuario.rol ?? actual.rol;

        await pool.query(
            'CALL sp_actualizar_usuario($1, $2, $3, $4, $5)',
            [id_usuario, nombre, correo, password, rol]
        );
        return true;
    }

    static async eliminar(id_usuario: number): Promise<boolean> {
        const actual = await this.obtenerPorId(id_usuario);
        if (!actual) return false;

        await pool.query(
            'CALL sp_eliminar_usuario($1)',
            [id_usuario]
        );
        return true;
    }
}