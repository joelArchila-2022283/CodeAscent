import { pool } from '../config/conexion';
import { INivelUsuario, INivelUsuarioRow } from '../interfaces/nivelUsuario.interface';

export class ModeloNivelUsuario {

    static async obtenerTodos(): Promise<INivelUsuario[]> {
        const resultado = await pool.query<INivelUsuarioRow>(
            'SELECT * FROM fn_obtener_niveles_usuario()'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_nivel_usuario: number): Promise<INivelUsuario | null> {
        const resultado = await pool.query<INivelUsuarioRow>(
            'SELECT * FROM fn_obtener_nivel_usuario_por_id($1)',
            [id_nivel_usuario]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuarioYNivel(id_usuario: number, id_nivel: number): Promise<INivelUsuario | null> {
        const resultado = await pool.query<INivelUsuarioRow>(
            'SELECT * FROM fn_obtener_niveles_usuario() WHERE id_usuario = $1 AND id_nivel = $2',
            [id_usuario, id_nivel]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async crear(datosNivelUsuario: INivelUsuario): Promise<boolean> {
        const { id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado } = datosNivelUsuario;
        await pool.query(
            'CALL sp_crear_nivel_usuario($1, $2, $3, $4, $5, $6)',
            [
                id_usuario,
                id_nivel,
                desbloqueado ?? false,
                completado ?? false,
                fecha_desbloqueo || null,
                fecha_completado || null
            ]
        );
        return true;
    }

    static async actualizar(id_nivel_usuario: number, datosNivelUsuario: Partial<INivelUsuario>): Promise<boolean> {
        const actual = await this.obtenerPorId(id_nivel_usuario);
        if (!actual) return false;

        const id_usuario = datosNivelUsuario.id_usuario ?? actual.id_usuario;
        const id_nivel = datosNivelUsuario.id_nivel ?? actual.id_nivel;
        const desbloqueado = datosNivelUsuario.desbloqueado ?? actual.desbloqueado;
        const completado = datosNivelUsuario.completado ?? actual.completado;
        const fecha_desbloqueo = datosNivelUsuario.fecha_desbloqueo ?? actual.fecha_desbloqueo;
        const fecha_completado = datosNivelUsuario.fecha_completado ?? actual.fecha_completado;

        await pool.query(
            'CALL sp_actualizar_nivel_usuario($1, $2, $3, $4, $5, $6, $7)',
            [
                id_nivel_usuario,
                id_usuario,
                id_nivel,
                desbloqueado,
                completado,
                fecha_desbloqueo || null,
                fecha_completado || null
            ]
        );
        return true;
    }

    static async eliminar(id_nivel_usuario: number): Promise<boolean> {
        const actual = await this.obtenerPorId(id_nivel_usuario);
        if (!actual) return false;

        await pool.query(
            'CALL sp_eliminar_nivel_usuario($1)',
            [id_nivel_usuario]
        );
        return true;
    }
}