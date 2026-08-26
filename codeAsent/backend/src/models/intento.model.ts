import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { IIntento, IIntentoRow } from './intento.interface';

export class ModeloIntento {

    static async obtenerTodos(): Promise<IIntento[]> {
        const [filas] = await pool.query<IIntentoRow[]>(
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

        return filas;
    }


    static async obtenerPorId(id_intento: number): Promise<IIntento | null> {
        const [filas] = await pool.query<IIntentoRow[]>(
            `SELECT
                id_intento,
                id_usuario,
                id_reto,
                respuesta_usuario,
                correcto,
                xp_obtenida,
                fecha_intento
            FROM intento
            WHERE id_intento = ?`,
            [id_intento]
        );

        return filas.length > 0 ? filas[0] : null;
    }


    static async obtenerPorUsuario(id_usuario: number): Promise<IIntento[]> {
        const [filas] = await pool.query<IIntentoRow[]>(
            `SELECT
                id_intento,
                id_usuario,
                id_reto,
                respuesta_usuario,
                correcto,
                xp_obtenida,
                fecha_intento
            FROM intento
            WHERE id_usuario = ?
            ORDER BY fecha_intento DESC`,
            [id_usuario]
        );

        return filas;
    }


    static async obtenerPorReto(id_reto: number): Promise<IIntento[]> {
        const [filas] = await pool.query<IIntentoRow[]>(
            `SELECT
                id_intento,
                id_usuario,
                id_reto,
                respuesta_usuario,
                correcto,
                xp_obtenida,
                fecha_intento
            FROM intento
            WHERE id_reto = ?
            ORDER BY fecha_intento DESC`,
            [id_reto]
        );

        return filas;
    }


    static async crear(datosIntento: IIntento): Promise<IIntento> {

        const {
            id_usuario,
            id_reto,
            respuesta_usuario,
            correcto,
            xp_obtenida
        } = datosIntento;

        const [resultado] = await pool.query<ResultSetHeader>(
            `INSERT INTO intento
                (
                    id_usuario,
                    id_reto,
                    respuesta_usuario,
                    correcto,
                    xp_obtenida
                )
            VALUES (?, ?, ?, ?, ?)`,
            [
                id_usuario,
                id_reto,
                respuesta_usuario ?? null,
                correcto,
                xp_obtenida ?? 0
            ]
        );

        return {
            id_intento: resultado.insertId,
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

        const [resultado] = await pool.query<ResultSetHeader>(
            `UPDATE intento
            SET
                respuesta_usuario = COALESCE(?, respuesta_usuario),
                correcto = COALESCE(?, correcto),
                xp_obtenida = COALESCE(?, xp_obtenida)
            WHERE id_intento = ?`,
            [
                respuesta_usuario ?? null,
                correcto ?? null,
                xp_obtenida ?? null,
                id_intento
            ]
        );

        return resultado.affectedRows > 0;
    }


    static async eliminar(id_intento: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            `DELETE FROM intento
            WHERE id_intento = ?`,
            [id_intento]
        );

        return resultado.affectedRows > 0;
    }
}