import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { IUsuarioLogro, IUsuarioLogroRow, IUsuarioLogroDetalle, IUsuarioLogroDetalleRow } from './usuarioLogro.interface';

export class ModeloUsuarioLogro {

    static async obtenerTodos(): Promise<IUsuarioLogro[]> {
        const [filas] = await pool.query<IUsuarioLogroRow[]>(
            'SELECT id_usuario_logro, id_usuario, id_logro, fecha_obtenido FROM usuario_logro'
        );
        return filas;
    }

    static async obtenerPorId(id_usuario_logro: number): Promise<IUsuarioLogro | null> {
        const [filas] = await pool.query<IUsuarioLogroRow[]>(
            'SELECT id_usuario_logro, id_usuario, id_logro, fecha_obtenido FROM usuario_logro WHERE id_usuario_logro = ?',
            [id_usuario_logro]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IUsuarioLogroDetalle[]> {
        const [filas] = await pool.query<IUsuarioLogroDetalleRow[]>(
            `SELECT 
                ul.id_usuario_logro,
                ul.id_usuario,
                ul.id_logro,
                ul.fecha_obtenido,
                l.nombre AS nombre_logro,
                l.descripcion AS descripcion_logro,
                l.xp_recompensa
             FROM usuario_logro ul
             INNER JOIN logro l ON ul.id_logro = l.id_logro
             WHERE ul.id_usuario = ? AND l.estado = TRUE
             ORDER BY ul.fecha_obtenido DESC`,
            [id_usuario]
        );
        return filas;
    }

    static async verificarExiste(id_usuario: number, id_logro: number): Promise<boolean> {
        const [filas] = await pool.query<IUsuarioLogroRow[]>(
            'SELECT id_usuario_logro FROM usuario_logro WHERE id_usuario = ? AND id_logro = ?',
            [id_usuario, id_logro]
        );
        return filas.length > 0;
    }

    static async asignarLogro(id_usuario: number, id_logro: number): Promise<IUsuarioLogro> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'INSERT INTO usuario_logro (id_usuario, id_logro) VALUES (?, ?)',
            [id_usuario, id_logro]
        );

        return {
            id_usuario_logro: resultado.insertId,
            id_usuario,
            id_logro,
            fecha_obtenido: new Date()
        };
    }

    static async eliminar(id_usuario_logro: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'DELETE FROM usuario_logro WHERE id_usuario_logro = ?',
            [id_usuario_logro]
        );
        return resultado.affectedRows > 0;
    }
}