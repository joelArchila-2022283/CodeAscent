import { pool } from '../config/conexion';
import { IProgreso, IProgresoRow } from '../interfaces/progreso.interface';

export class ModeloProgreso {

    static async obtenerTodos(): Promise<IProgreso[]> {
        const resultado = await pool.query<IProgresoRow>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             ORDER BY fecha_actualizacion DESC`
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_progreso: number): Promise<IProgreso | null> {
        const resultado = await pool.query<IProgresoRow>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             WHERE id_progreso = $1`,
            [id_progreso]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuarioYLenguaje(id_usuario: number, id_lenguaje: number): Promise<IProgreso | null> {
        const resultado = await pool.query<IProgresoRow>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             WHERE id_usuario = $1 AND id_lenguaje = $2`,
            [id_usuario, id_lenguaje]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IProgreso[]> {
        const resultado = await pool.query<IProgresoRow>(
            `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion 
             FROM progreso 
             WHERE id_usuario = $1`,
            [id_usuario]
        );
        return resultado.rows;
    }

    static async crear(datosProgreso: IProgreso): Promise<IProgreso> {
        const { id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje } = datosProgreso;
        const resultado = await pool.query(
            `INSERT INTO progreso (id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id_progreso`,
            [
                id_usuario,
                id_lenguaje,
                id_nivel_actual ?? null,
                xp_actual ?? 0,
                porcentaje ?? 0.00
            ]
        );

        return {
            id_progreso: resultado.rows[0].id_progreso,
            id_usuario,
            id_lenguaje,
            id_nivel_actual: id_nivel_actual ?? null,
            xp_actual: xp_actual ?? 0,
            porcentaje: porcentaje ?? 0.00
        };
    }

    static async actualizar(id_progreso: number, datosProgreso: Partial<IProgreso>): Promise<boolean> {
        const { id_nivel_actual, xp_actual, porcentaje } = datosProgreso;
        const resultado = await pool.query(
            `UPDATE progreso 
             SET 
                id_nivel_actual = COALESCE($1, id_nivel_actual),
                xp_actual = COALESCE($2, xp_actual),
                porcentaje = COALESCE($3, porcentaje),
                fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id_progreso = $4`,
            [
                id_nivel_actual !== undefined ? id_nivel_actual : null,
                xp_actual !== undefined ? xp_actual : null,
                porcentaje !== undefined ? porcentaje : null,
                id_progreso
            ]
        );
        return (resultado.rowCount ?? 0) > 0;
    }

    static async eliminar(id_progreso: number): Promise<boolean> {
        const resultado = await pool.query(
            'DELETE FROM progreso WHERE id_progreso = $1',
            [id_progreso]
        );
        return (resultado.rowCount ?? 0) > 0;
    }
}