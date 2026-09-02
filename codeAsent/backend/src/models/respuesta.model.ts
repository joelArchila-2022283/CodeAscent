import { pool } from '../config/conexion';
import { IRespuesta, IRespuestaRow } from '../interfaces/respuesta.interface';

export class ModeloRespuesta {

    static async obtenerTodas(): Promise<IRespuesta[]> {
        const resultado = await pool.query<IRespuestaRow>(
            'SELECT id_respuesta, id_reto, contenido, es_correcta FROM respuesta'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_respuesta: number): Promise<IRespuesta | null> {
        const resultado = await pool.query<IRespuestaRow>(
            'SELECT id_respuesta, id_reto, contenido, es_correcta FROM respuesta WHERE id_respuesta = $1',
            [id_respuesta]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorReto(id_reto: number): Promise<IRespuesta[]> {
        const resultado = await pool.query<IRespuestaRow>(
            'SELECT id_respuesta, id_reto, contenido, es_correcta FROM respuesta WHERE id_reto = $1',
            [id_reto]
        );
        return resultado.rows;
    }

    static async crear(datosRespuesta: IRespuesta): Promise<IRespuesta> {
        const { id_reto, contenido, es_correcta } = datosRespuesta;
        const resultado = await pool.query(
            'INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES ($1, $2, $3) RETURNING id_respuesta',
            [id_reto, contenido, es_correcta ?? false]
        );

        return {
            id_respuesta: resultado.rows[0].id_respuesta,
            id_reto,
            contenido,
            es_correcta: es_correcta ?? false
        };
    }

    static async actualizar(id_respuesta: number, datosRespuesta: Partial<IRespuesta>): Promise<boolean> {
        const { id_reto, contenido, es_correcta } = datosRespuesta;
        const resultado = await pool.query(
            'UPDATE respuesta SET id_reto = COALESCE($1, id_reto), contenido = COALESCE($2, contenido), es_correcta = COALESCE($3, es_correcta) WHERE id_respuesta = $4',
            [
                id_reto || null,
                contenido || null,
                es_correcta !== undefined ? es_correcta : null,
                id_respuesta
            ]
        );

        return (resultado.rowCount ?? 0) > 0;
    }

    static async eliminar(id_respuesta: number): Promise<boolean> {
        const resultado = await pool.query(
            'DELETE FROM respuesta WHERE id_respuesta = $1',
            [id_respuesta]
        );

        return (resultado.rowCount ?? 0) > 0;
    }

}