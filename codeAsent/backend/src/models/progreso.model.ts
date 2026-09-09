import { pool } from '../config/conexion';
import { IProgreso, IProgresoRow } from '../interfaces/progreso.interface';

export class ModeloProgreso {

    static async obtenerTodos(): Promise<IProgreso[]> {
        const resultado = await pool.query<IProgresoRow>(
            'SELECT * FROM fn_obtener_progresos()'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_progreso: number): Promise<IProgreso | null> {
        const resultado = await pool.query<IProgresoRow>(
            'SELECT * FROM fn_obtener_progreso_por_id($1)',
            [id_progreso]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuarioYLenguaje(id_usuario: number, id_lenguaje: number): Promise<IProgreso | null> {
        const resultado = await pool.query<IProgresoRow>(
            'SELECT * FROM fn_obtener_progresos() WHERE id_usuario = $1 AND id_lenguaje = $2',
            [id_usuario, id_lenguaje]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IProgreso[]> {
        const resultado = await pool.query<IProgresoRow>(
            'SELECT * FROM fn_obtener_progresos() WHERE id_usuario = $1',
            [id_usuario]
        );
        return resultado.rows;
    }

    static async crear(datosProgreso: IProgreso): Promise<boolean> {
        const { id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje } = datosProgreso;
        await pool.query(
            'CALL sp_crear_progreso($1, $2, $3, $4, $5)',
            [
                id_usuario,
                id_lenguaje,
                id_nivel_actual ?? null,
                xp_actual ?? 0,
                porcentaje ?? 0.00
            ]
        );
        return true;
    }

    static async actualizar(id_progreso: number, datosProgreso: Partial<IProgreso>): Promise<boolean> {
        const actual = await this.obtenerPorId(id_progreso);
        if (!actual) return false;

        const id_nivel_actual = datosProgreso.id_nivel_actual ?? actual.id_nivel_actual;
        const xp_actual = datosProgreso.xp_actual ?? actual.xp_actual;
        const porcentaje = datosProgreso.porcentaje ?? actual.porcentaje;

        await pool.query(
            'CALL sp_actualizar_progreso($1, $2, $3, $4)',
            [
                id_progreso,
                id_nivel_actual ?? null,
                xp_actual ?? 0,
                porcentaje ?? 0.00
            ]
        );
        return true;
    }

    static async eliminar(id_progreso: number): Promise<boolean> {
        const actual = await this.obtenerPorId(id_progreso);
        if (!actual) return false;

        await pool.query(
            'CALL sp_eliminar_progreso($1)',
            [id_progreso]
        );
        return true;
    }
}