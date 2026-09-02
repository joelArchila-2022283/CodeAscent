import { pool } from '../config/conexion';
import { INivelUsuario, INivelUsuarioRow } from '../interfaces/nivelUsuario.interface';

export class ModeloNivelUsuario {

    static async obtenerTodos(): Promise<INivelUsuario[]> {
        const resultado = await pool.query<INivelUsuarioRow>(
            'SELECT id_nivel_usuario, id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado FROM nivel_usuario'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_nivel_usuario: number): Promise<INivelUsuario | null> {
        const resultado = await pool.query<INivelUsuarioRow>(
            'SELECT id_nivel_usuario, id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado FROM nivel_usuario WHERE id_nivel_usuario = $1',
            [id_nivel_usuario]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuarioYNivel(id_usuario: number, id_nivel: number): Promise<INivelUsuario | null> {
        const resultado = await pool.query<INivelUsuarioRow>(
            'SELECT id_nivel_usuario, id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado FROM nivel_usuario WHERE id_usuario = $1 AND id_nivel = $2',
            [id_usuario, id_nivel]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async crear(datosNivelUsuario: INivelUsuario): Promise<INivelUsuario> {
        const { id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado } = datosNivelUsuario;
        const resultado = await pool.query(
            'INSERT INTO nivel_usuario (id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_nivel_usuario',
            [
                id_usuario,
                id_nivel,
                desbloqueado ?? false,
                completado ?? false,
                fecha_desbloqueo || null,
                fecha_completado || null
            ]
        );

        return {
            id_nivel_usuario: resultado.rows[0].id_nivel_usuario,
            id_usuario,
            id_nivel,
            desbloqueado: desbloqueado ?? false,
            completado: completado ?? false,
            fecha_desbloqueo: fecha_desbloqueo || null,
            fecha_completado: fecha_completado || null
        };
    }

    static async actualizar(id_nivel_usuario: number, datosNivelUsuario: Partial<INivelUsuario>): Promise<boolean> {
        const { id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado } = datosNivelUsuario;
        const resultado = await pool.query(
            'UPDATE nivel_usuario SET id_usuario = COALESCE($1, id_usuario), id_nivel = COALESCE($2, id_nivel), desbloqueado = COALESCE($3, desbloqueado), completado = COALESCE($4, completado), fecha_desbloqueo = COALESCE($5, fecha_desbloqueo), fecha_completado = COALESCE($6, fecha_completado) WHERE id_nivel_usuario = $7',
            [
                id_usuario || null,
                id_nivel || null,
                desbloqueado !== undefined ? desbloqueado : null,
                completado !== undefined ? completado : null,
                fecha_desbloqueo || null,
                fecha_completado || null,
                id_nivel_usuario
            ]
        );

        return (resultado.rowCount ?? 0) > 0;
    }

    static async eliminar(id_nivel_usuario: number): Promise<boolean> {
        const resultado = await pool.query(
            'DELETE FROM nivel_usuario WHERE id_nivel_usuario = $1',
            [id_nivel_usuario]
        );

        return (resultado.rowCount ?? 0) > 0;
    }

}