import { pool } from '../config/conexion';
import { IIntento, IIntentoRow } from '../interfaces/intento.interface';

export class ModeloIntento {

    static async obtenerTodos(): Promise<IIntento[]> {
        const resultado = await pool.query<IIntentoRow>(
            'SELECT * FROM fn_obtener_intentos()'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_intento: number): Promise<IIntento | null> {
        const resultado = await pool.query<IIntentoRow>(
            'SELECT * FROM fn_obtener_intento_por_id($1)',
            [id_intento]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IIntento[]> {
        const resultado = await pool.query<IIntentoRow>(
            'SELECT * FROM fn_obtener_intentos() WHERE id_usuario = $1 ORDER BY fecha_intento DESC',
            [id_usuario]
        );
        return resultado.rows;
    }

    static async obtenerPorReto(id_reto: number): Promise<IIntento[]> {
        const resultado = await pool.query<IIntentoRow>(
            'SELECT * FROM fn_obtener_intentos() WHERE id_reto = $1 ORDER BY fecha_intento DESC',
            [id_reto]
        );
        return resultado.rows;
    }

    static async crear(datosIntento: IIntento): Promise<boolean> {
        const { id_usuario, id_reto, respuesta_usuario, correcto, xp_obtenida } = datosIntento;
        await pool.query(
            'CALL sp_crear_intento($1, $2, $3, $4, $5)',
            [id_usuario, id_reto, respuesta_usuario ?? null, correcto, xp_obtenida ?? 0]
        );
        return true;
    }

    static async actualizar(
        id_intento: number,
        datosIntento: Partial<IIntento>
    ): Promise<boolean> {
        const intentoActual = await this.obtenerPorId(id_intento);
        if (!intentoActual) return false;

        const respuesta_usuario = datosIntento.respuesta_usuario ?? intentoActual.respuesta_usuario;
        const correcto = datosIntento.correcto ?? intentoActual.correcto;
        const xp_obtenida = datosIntento.xp_obtenida ?? intentoActual.xp_obtenida;

        await pool.query(
            'CALL sp_actualizar_intento($1, $2, $3, $4)',
            [id_intento, respuesta_usuario, correcto, xp_obtenida]
        );
        return true;
    }

    static async eliminar(id_intento: number): Promise<boolean> {
        const intentoActual = await this.obtenerPorId(id_intento);
        if (!intentoActual) return false;

        await pool.query(
            'CALL sp_eliminar_intento($1)',
            [id_intento]
        );
        return true;
    }
}