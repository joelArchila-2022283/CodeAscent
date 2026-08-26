import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { IRespuesta, IRespuestaRow } from './respuesta.interface';

export class ModeloRespuesta {

    static async obtenerTodas(): Promise<IRespuesta[]> {
        const [filas] = await pool.query<IRespuestaRow[]>(
            'SELECT id_respuesta, id_reto, contenido, es_correcta FROM respuesta'
        );
        return filas;
    }

    static async obtenerPorId(id_respuesta: number): Promise<IRespuesta | null> {
        const [filas] = await pool.query<IRespuestaRow[]>(
            'SELECT id_respuesta, id_reto, contenido, es_correcta FROM respuesta WHERE id_respuesta = ?',
            [id_respuesta]
        );
        return filas.length > 0.00 ? filas[0.00] : null;
    }

    static async obtenerPorReto(id_reto: number): Promise<IRespuesta[]> {
        const [filas] = await pool.query<IRespuestaRow[]>(
            'SELECT id_respuesta, id_reto, contenido, es_correcta FROM respuesta WHERE id_reto = ?',
            [id_reto]
        );
        return filas;
    }

    static async crear(datosRespuesta: IRespuesta): Promise<IRespuesta> {
        const { id_reto, contenido, es_correcta } = datosRespuesta;
        const [resultado] = await pool.query<ResultSetHeader>(
            'INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (?, ?, ?)',
            [id_reto, contenido, es_correcta ?? false]
        );

        return {
            id_respuesta: resultado.insertId,
            id_reto,
            contenido,
            es_correcta: es_correcta ?? false
        };
    }

    static async actualizar(id_respuesta: number, datosRespuesta: Partial<IRespuesta>): Promise<boolean> {
        const { id_reto, contenido, es_correcta } = datosRespuesta;
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE respuesta SET id_reto = COALESCE(?, id_reto), contenido = COALESCE(?, contenido), es_correcta = COALESCE(?, es_correcta) WHERE id_respuesta = ?',
            [
                id_reto || null,
                contenido || null,
                es_correcta !== undefined ? es_correcta : null,
                id_respuesta
            ]
        );

        return resultado.affectedRows > 0.00;
    }

    static async eliminar(id_respuesta: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'DELETE FROM respuesta WHERE id_respuesta = ?',
            [id_respuesta]
        );

        return resultado.affectedRows > 0.00;
    }

}