import { pool } from '../config/conexion';
import { IUsuario, IUsuarioRow } from '../interfaces/usuario.interface';

export class ModeloUsuario {

    static async obtenerTodos(): Promise<IUsuario[]> {
        const resultado = await pool.query<IUsuarioRow>(
            `SELECT 
                id_usuario,
                nombre,
                correo,
                password,
                rol,
                fecha_registro
            FROM usuario`
        );

        return resultado.rows;
    }


    static async obtenerPorId(id_usuario: number): Promise<IUsuario | null> {
        const resultado = await pool.query<IUsuarioRow>(
            `SELECT 
                id_usuario,
                nombre,
                correo,
                password,
                rol,
                fecha_registro
            FROM usuario
            WHERE id_usuario = $1`,
            [id_usuario]
        );

        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }


    static async obtenerPorCorreo(correo: string): Promise<IUsuario | null> {
        const resultado = await pool.query<IUsuarioRow>(
            `SELECT 
                id_usuario,
                nombre,
                correo,
                password,
                rol,
                fecha_registro
            FROM usuario
            WHERE correo = $1`,
            [correo]
        );

        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }


    static async crear(datosUsuario: IUsuario): Promise<IUsuario> {

        const {
            nombre,
            correo,
            password,
            rol
        } = datosUsuario;

        const resultado = await pool.query(
            `INSERT INTO usuario
                (nombre, correo, password, rol)
            VALUES ($1, $2, $3, $4) RETURNING id_usuario`,
            [
                nombre,
                correo,
                password,
                rol || 'jugador'
            ]
        );

        return {
            id_usuario: resultado.rows[0].id_usuario,
            nombre,
            correo,
            password,
            rol: rol || 'jugador'
        };
    }


    static async actualizar(
        id_usuario: number,
        datosUsuario: Partial<IUsuario>
    ): Promise<boolean> {

        const {
            nombre,
            correo,
            password,
            rol
        } = datosUsuario;

        const resultado = await pool.query(
            `UPDATE usuario
            SET
                nombre = COALESCE($1, nombre),
                correo = COALESCE($2, correo),
                password = COALESCE($3, password),
                rol = COALESCE($4, rol)
            WHERE id_usuario = $5`,
            [
                nombre || null,
                correo || null,
                password || null,
                rol || null,
                id_usuario
            ]
        );

        return (resultado.rowCount ?? 0) > 0;
    }


    static async eliminar(id_usuario: number): Promise<boolean> {

        const resultado = await pool.query(
            `DELETE FROM usuario
            WHERE id_usuario = $1`,
            [id_usuario]
        );

        return (resultado.rowCount ?? 0) > 0;
    }
}