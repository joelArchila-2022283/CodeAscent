import { pool } from '../config/conexion';
import { IIntento, IIntentoRow } from '../interfaces/intento.interface';

export class ModeloIntento {

    static async obtenerTodos(): Promise<IIntento[]> {
        const resultado = await pool.query<IIntentoRow>(
            `SELECT
                id_intento,
                id_usuario,
                id_reto,
                respuesta_usuario,
                correcto,
                xp_obtenida,
                fecha_intento
            FROM intento`
        );

        return resultado.rows;
    }


    static async obtenerPorId(id_intento: number): Promise<IIntento | null> {
        const resultado = await pool.query<IIntentoRow>(
            `SELECT
                id_intento,
                id_usuario,
                id_reto,
                respuesta_usuario,
                correcto,
                xp_obtenida,
                fecha_intento
            FROM intento
            WHERE id_intento = $1`,
            [id_intento]
        );

        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }


    static async obtenerPorUsuario(id_usuario: number): Promise<IIntento[]> {
        const resultado = await pool.query<IIntentoRow>(
            `SELECT
                id_intento,
                id_usuario,
                id_reto,
                respuesta_usuario,
                correcto,
                xp_obtenida,
                fecha_intento
            FROM intento
            WHERE id_usuario = $1
            ORDER BY fecha_intento DESC`,
            [id_usuario]
        );

        return resultado.rows;
    }


    static async obtenerPorReto(id_reto: number): Promise<IIntento[]> {
        const resultado = await pool.query<IIntentoRow>(
            `SELECT
                id_intento,
                id_usuario,
                id_reto,
                respuesta_usuario,
                correcto,
                xp_obtenida,
                fecha_intento
            FROM intento
            WHERE id_reto = $1
            ORDER BY fecha_intento DESC`,
            [id_reto]
        );

        return resultado.rows;
    }


    static async crear(datosIntento: IIntento): Promise<IIntento> {

        const {
            id_usuario,
            id_reto,
            respuesta_usuario,
            correcto,
            xp_obtenida
        } = datosIntento;

        const resultado = await pool.query(
            `INSERT INTO intento
                (
                    id_usuario,
                    id_reto,
                    respuesta_usuario,
                    correcto,
                    xp_obtenida
                )
            VALUES ($1, $2, $3, $4, $5) RETURNING id_intento`,
            [
                id_usuario,
                id_reto,
                respuesta_usuario ?? null,
                correcto,
                xp_obtenida ?? 0
            ]
        );

        return {
            id_intento: resultado.rows[0].id_intento,
            id_usuario,
            id_reto,
            respuesta_usuario,
            correcto,
            xp_obtenida: xp_obtenida ?? 0
        };
    }


    static async actualizar(
        id_intento: number,
        datosIntento: Partial<IIntento>
    ): Promise<boolean> {

        const {
            respuesta_usuario,
            correcto,
            xp_obtenida
        } = datosIntento;

        const resultado = await pool.query(
            `UPDATE intento
            SET
                respuesta_usuario = COALESCE($1, respuesta_usuario),
                correcto = COALESCE($2, correcto),
                xp_obtenida = COALESCE($3, xp_obtenida)
            WHERE id_intento = $4`,
            [
                respuesta_usuario ?? null,
                correcto ?? null,
                xp_obtenida ?? null,
                id_intento
            ]
        );

        return (resultado.rowCount ?? 0) > 0;
    }


    static async eliminar(id_intento: number): Promise<boolean> {
        const resultado = await pool.query(
            `DELETE FROM intento
            WHERE id_intento = $1`,
            [id_intento]
        );

        return (resultado.rowCount ?? 0) > 0;
    }
}