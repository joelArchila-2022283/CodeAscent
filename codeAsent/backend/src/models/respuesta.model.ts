import { pool } from '../config/conexion';
import { IRespuesta, IRespuestaRow } from '../interfaces/respuesta.interface';

export class ModeloRespuesta {

    static async obtenerTodas(): Promise<IRespuesta[]> {
        const resultado = await pool.query<IRespuestaRow>(
            'SELECT * FROM fn_obtener_respuestas()'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_respuesta: number): Promise<IRespuesta | null> {
        const resultado = await pool.query<IRespuestaRow>(
            'SELECT * FROM fn_obtener_respuesta_por_id($1)',
            [id_respuesta]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorReto(id_reto: number): Promise<IRespuesta[]> {
        const resultado = await pool.query<IRespuestaRow>(
            'SELECT * FROM fn_obtener_respuestas() WHERE id_reto = $1',
            [id_reto]
        );
        return resultado.rows;
    }

    static async crear(datosRespuesta: IRespuesta): Promise<boolean> {
        const { id_reto, contenido, es_correcta } = datosRespuesta;
        await pool.query(
            'CALL sp_crear_respuesta($1, $2, $3)',
            [id_reto, contenido, es_correcta ?? false]
        );
        return true;
    }

    static async actualizar(id_respuesta: number, datosRespuesta: Partial<IRespuesta>): Promise<boolean> {
        const actual = await this.obtenerPorId(id_respuesta);
        if (!actual) return false;

        const id_reto = datosRespuesta.id_reto ?? actual.id_reto;
        const contenido = datosRespuesta.contenido ?? actual.contenido;
        const es_correcta = datosRespuesta.es_correcta ?? actual.es_correcta;

        await pool.query(
            'CALL sp_actualizar_respuesta($1, $2, $3, $4)',
            [id_respuesta, id_reto, contenido, es_correcta]
        );
        return true;
    }

    static async eliminar(id_respuesta: number): Promise<boolean> {
        const actual = await this.obtenerPorId(id_respuesta);
        if (!actual) return false;

        await pool.query(
            'CALL sp_eliminar_respuesta($1)',
            [id_respuesta]
        );
        return true;
    }
}