import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { IProgreso, IProgresoRow } from './progreso.interface';

export class ModeloProgreso {

    static async obtenerTodos(): Promise<IProgreso[]> {
        const [filas] = await pool.query<IProgresoRow[]>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             ORDER BY fecha_actualizacion DESC`
        );
        return filas;
    }

    static async obtenerPorId(id_progreso: number): Promise<IProgreso | null> {
        const [filas] = await pool.query<IProgresoRow[]>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             WHERE id_progreso = ?`,
            [id_progreso]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorUsuarioYLenguaje(id_usuario: number, id_lenguaje: number): Promise<IProgreso | null> {
        const [filas] = await pool.query<IProgresoRow[]>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             WHERE id_usuario = ? AND id_lenguaje = ?`,
            [id_usuario, id_lenguaje]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IProgreso[]> {
        const [filas] = await pool.query<IProgresoRow[]>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             WHERE id_usuario = ?`,
            [id_usuario]
        );
        return filas;
    }

    static async crear(datosProgreso: IProgreso): Promise<IProgreso> {
        const { id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje } = datosProgreso;
        const [resultado] = await pool.query<ResultSetHeader>(
            `INSERT INTO progreso (id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                id_usuario,
                id_lenguaje,
                id_nivel_actual ?? null,
                xp_actual ?? 0,
                porcentaje ?? 0.00
            ]
        );

        return {
            id_progreso: resultado.insertId,
            id_usuario,
            id_lenguaje,
            id_nivel_actual: id_nivel_actual ?? null,
            xp_actual: xp_actual ?? 0,
            porcentaje: porcentaje ?? 0.00
        };
    }

    static async actualizar(id_progreso: number, datosProgreso: Partial<IProgreso>): Promise<boolean> {
        const { id_nivel_actual, xp_actual, porcentaje } = datosProgreso;
        const [resultado] = await pool.query<ResultSetHeader>(
            `UPDATE progreso 
             SET 
                id_nivel_actual = COALESCE(?, id_nivel_actual),
                xp_actual = COALESCE(?, xp_actual),
                porcentaje = COALESCE(?, porcentaje)
             WHERE id_progreso = ?`,
            [
                id_nivel_actual !== undefined ? id_nivel_actual : null,
                xp_actual !== undefined ? xp_actual : null,
                porcentaje !== undefined ? porcentaje : null,
                id_progreso
            ]
        );
        return resultado.affectedRows > 0;
    }

    static async eliminar(id_progreso: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'DELETE FROM progreso WHERE id_progreso = ?',
            [id_progreso]
        );
        return resultado.affectedRows > 0;
    }
}