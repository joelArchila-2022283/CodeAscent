import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { INivelUsuario, INivelUsuarioRow } from './nivelUsuario.interface';

export class ModeloNivelUsuario {

    static async obtenerTodos(): Promise<INivelUsuario[]> {
        const [filas] = await pool.query<INivelUsuarioRow[]>(
            'SELECT id_nivel_usuario, id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado FROM nivel_usuario'
        );
        return filas;
    }

    static async obtenerPorId(id_nivel_usuario: number): Promise<INivelUsuario | null> {
        const [filas] = await pool.query<INivelUsuarioRow[]>(
            'SELECT id_nivel_usuario, id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado FROM nivel_usuario WHERE id_nivel_usuario = ?',
            [id_nivel_usuario]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorUsuarioYNivel(id_usuario: number, id_nivel: number): Promise<INivelUsuario | null> {
        const [filas] = await pool.query<INivelUsuarioRow[]>(
            'SELECT id_nivel_usuario, id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado FROM nivel_usuario WHERE id_usuario = ? AND id_nivel = ?',
            [id_usuario, id_nivel]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async crear(datosNivelUsuario: INivelUsuario): Promise<INivelUsuario> {
        const { id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado } = datosNivelUsuario;
        const [resultado] = await pool.query<ResultSetHeader>(
            'INSERT INTO nivel_usuario (id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado) VALUES (?, ?, ?, ?, ?, ?)',
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
            id_nivel_usuario: resultado.insertId,
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
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE nivel_usuario SET id_usuario = COALESCE(?, id_usuario), id_nivel = COALESCE(?, id_nivel), desbloqueado = COALESCE(?, desbloqueado), completado = COALESCE(?, completado), fecha_desbloqueo = COALESCE(?, fecha_desbloqueo), fecha_completado = COALESCE(?, fecha_completado) WHERE id_nivel_usuario = ?',
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

        return resultado.affectedRows > 0;
    }

    static async eliminar(id_nivel_usuario: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'DELETE FROM nivel_usuario WHERE id_nivel_usuario = ?',
            [id_nivel_usuario]
        );

        return resultado.affectedRows > 0;
    }

}