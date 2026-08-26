import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { IUsuario, IUsuarioRow } from './usuario.interface';

export class ModeloUsuario {

    static async obtenerTodos(): Promise<IUsuario[]> {
        const [filas] = await pool.query<IUsuarioRow[]>(
            `SELECT 
                id_usuario,
                nombre,
                correo,
                password,
                rol,
                fecha_registro
            FROM usuario`
        );

        return filas;
    }


    static async obtenerPorId(id_usuario: number): Promise<IUsuario | null> {
        const [filas] = await pool.query<IUsuarioRow[]>(
            `SELECT 
                id_usuario,
                nombre,
                correo,
                password,
                rol,
                fecha_registro
            FROM usuario
            WHERE id_usuario = ?`,
            [id_usuario]
        );

        return filas.length > 0 ? filas[0] : null;
    }


    static async obtenerPorCorreo(correo: string): Promise<IUsuario | null> {
        const [filas] = await pool.query<IUsuarioRow[]>(
            `SELECT 
                id_usuario,
                nombre,
                correo,
                password,
                rol,
                fecha_registro
            FROM usuario
            WHERE correo = ?`,
            [correo]
        );

        return filas.length > 0 ? filas[0] : null;
    }


    static async crear(datosUsuario: IUsuario): Promise<IUsuario> {

        const {
            nombre,
            correo,
            password,
            rol
        } = datosUsuario;

        const [resultado] = await pool.query<ResultSetHeader>(
            `INSERT INTO usuario
                (nombre, correo, password, rol)
            VALUES (?, ?, ?, ?)`,
            [
                nombre,
                correo,
                password,
                rol || 'jugador'
            ]
        );

        return {
            id_usuario: resultado.insertId,
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

        const [resultado] = await pool.query<ResultSetHeader>(
            `UPDATE usuario
            SET
                nombre = COALESCE(?, nombre),
                correo = COALESCE(?, correo),
                password = COALESCE(?, password),
                rol = COALESCE(?, rol)
            WHERE id_usuario = ?`,
            [
                nombre || null,
                correo || null,
                password || null,
                rol || null,
                id_usuario
            ]
        );

        return resultado.affectedRows > 0;
    }


    static async eliminar(id_usuario: number): Promise<boolean> {

        const [resultado] = await pool.query<ResultSetHeader>(
            `DELETE FROM usuario
            WHERE id_usuario = ?`,
            [id_usuario]
        );

        return resultado.affectedRows > 0;
    }
}