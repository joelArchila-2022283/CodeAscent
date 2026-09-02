import { pool } from '../config/conexion';
import { IUsuarioLogro, IUsuarioLogroRow, IUsuarioLogroDetalle, IUsuarioLogroDetalleRow } from '../interfaces/usuarioLogro.interface';

export class ModeloUsuarioLogro {

    static async obtenerTodos(): Promise<IUsuarioLogro[]> {
        const resultado = await pool.query<IUsuarioLogroRow>(
            'SELECT id_usuario_logro, id_usuario, id_logro, fecha_obtenido FROM usuario_logro'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_usuario_logro: number): Promise<IUsuarioLogro | null> {
        const resultado = await pool.query<IUsuarioLogroRow>(
            'SELECT id_usuario_logro, id_usuario, id_logro, fecha_obtenido FROM usuario_logro WHERE id_usuario_logro = $1',
            [id_usuario_logro]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IUsuarioLogroDetalle[]> {
        const resultado = await pool.query<IUsuarioLogroDetalleRow>(
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
             WHERE ul.id_usuario = $1 AND l.estado = TRUE
             ORDER BY ul.fecha_obtenido DESC`,
            [id_usuario]
        );
        return resultado.rows;
    }

    static async verificarExiste(id_usuario: number, id_logro: number): Promise<boolean> {
        const resultado = await pool.query<IUsuarioLogroRow>(
            'SELECT id_usuario_logro FROM usuario_logro WHERE id_usuario = $1 AND id_logro = $2',
            [id_usuario, id_logro]
        );
        return resultado.rows.length > 0;
    }

    static async asignarLogro(id_usuario: number, id_logro: number): Promise<IUsuarioLogro> {
        const resultado = await pool.query(
            'INSERT INTO usuario_logro (id_usuario, id_logro) VALUES ($1, $2) RETURNING id_usuario_logro',
            [id_usuario, id_logro]
        );

        return {
            id_usuario_logro: resultado.rows[0].id_usuario_logro,
            id_usuario,
            id_logro,
            fecha_obtenido: new Date()
        };
    }

    static async eliminar(id_usuario_logro: number): Promise<boolean> {
        const resultado = await pool.query(
            'DELETE FROM usuario_logro WHERE id_usuario_logro = $1',
            [id_usuario_logro]
        );
        return (resultado.rowCount ?? 0) > 0;
    }
}