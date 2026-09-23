import { pool } from '../config/conexion';
import { Logro, LogroRow } from '../interfaces/logro.interface';

export class ModeloLogro {

    static async obtenerTodos(): Promise<Logro[]> {
        const resultado = await pool.query<LogroRow>(
            'SELECT * FROM fn_obtener_logros() WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_logro: number): Promise<Logro | null> {
        const resultado = await pool.query<LogroRow>(
            'SELECT * FROM fn_obtener_logro_por_id($1)',
            [id_logro]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorNombre(nombre: string): Promise<Logro | null> {
        const resultado = await pool.query<LogroRow>(
            'SELECT * FROM fn_obtener_logros() WHERE nombre = $1',
            [nombre]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async crear(datosLogro: Logro): Promise<boolean> {
        const { nombre, descripcion, xp_recompensa, requisito } = datosLogro;
        await pool.query(
            'CALL sp_crear_logro($1, $2, $3, $4)',
            [
                nombre,
                descripcion || null,
                xp_recompensa ?? 0,
                requisito || null
            ]
        );
        return true;
    }

    static async actualizar(id_logro: number, datosLogro: Partial<Logro>): Promise<boolean> {
        const logroActual = await this.obtenerPorId(id_logro);
        if (!logroActual) return false;

        const nombre = datosLogro.nombre ?? logroActual.nombre;
        const descripcion = datosLogro.descripcion ?? logroActual.descripcion;
        const xp_recompensa = datosLogro.xp_recompensa ?? logroActual.xp_recompensa;
        const requisito = datosLogro.requisito ?? logroActual.requisito;
        const estado = datosLogro.estado ?? logroActual.estado ?? true;

        await pool.query(
            'CALL sp_actualizar_logro($1, $2, $3, $4, $5, $6)',
            [id_logro, nombre, descripcion, xp_recompensa, requisito, estado]
        );
        return true;
    }

    static async desactivar(id_logro: number): Promise<boolean> {
        const logroActual = await this.obtenerPorId(id_logro);
        if (!logroActual) return false;

        await pool.query(
            'CALL sp_actualizar_logro($1, $2, $3, $4, $5, $6)',
            [id_logro, logroActual.nombre, logroActual.descripcion, logroActual.xp_recompensa, logroActual.requisito, false]
        );
        return true;
    }
}