import { pool } from '../config/conexion';
import { IUsuarioLogro, IUsuarioLogroRow, IUsuarioLogroDetalle, IUsuarioLogroDetalleRow } from '../interfaces/usuarioLogro.interface';

export class ModeloUsuarioLogro {

    static async obtenerTodos(): Promise<IUsuarioLogro[]> {
        const resultado = await pool.query<IUsuarioLogroRow>(
            'SELECT * FROM fn_obtener_usuarios_logros()'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_usuario_logro: number): Promise<IUsuarioLogro | null> {
        const resultado = await pool.query<IUsuarioLogroRow>(
            'SELECT * FROM fn_obtener_usuario_logro_por_id($1)',
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
             FROM fn_obtener_usuarios_logros() ul
             INNER JOIN fn_obtener_logros() l ON ul.id_logro = l.id_logro
             WHERE ul.id_usuario = $1 AND l.estado = TRUE
             ORDER BY ul.fecha_obtenido DESC`,
            [id_usuario]
        );
        return resultado.rows;
    }

    static async verificarExiste(id_usuario: number, id_logro: number): Promise<boolean> {
        const resultado = await pool.query<IUsuarioLogroRow>(
            'SELECT * FROM fn_obtener_usuarios_logros() WHERE id_usuario = $1 AND id_logro = $2',
            [id_usuario, id_logro]
        );
        return resultado.rows.length > 0;
    }

    static async asignarLogro(id_usuario: number, id_logro: number): Promise<boolean> {
        await pool.query(
            'CALL sp_crear_usuario_logro($1, $2)',
            [id_usuario, id_logro]
        );
        return true;
    }

    static async eliminar(id_usuario_logro: number): Promise<boolean> {
        const actual = await this.obtenerPorId(id_usuario_logro);
        if (!actual) return false;

        await pool.query(
            'CALL sp_eliminar_usuario_logro($1)',
            [id_usuario_logro]
        );
        return true;
    }
}