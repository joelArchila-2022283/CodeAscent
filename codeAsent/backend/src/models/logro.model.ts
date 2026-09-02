import { pool } from '../config/conexion';
import { Logro, LogroRow } from '../interfaces/logro.interface';

export class ModeloLogro {

    static async obtenerTodos(): Promise<Logro[]> {
        const resultado = await pool.query<LogroRow>(
            'SELECT id_logro, nombre, descripcion, xp_recompensa, requisito, estado FROM logro WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_logro: number): Promise<Logro | null> {
        const resultado = await pool.query<LogroRow>(
            'SELECT id_logro, nombre, descripcion, xp_recompensa, requisito, estado FROM logro WHERE id_logro = $1 AND estado = TRUE',
            [id_logro]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorNombre(nombre: string): Promise<Logro | null> {
        const resultado = await pool.query<LogroRow>(
            'SELECT id_logro, nombre, descripcion, xp_recompensa, requisito, estado FROM logro WHERE nombre = $1',
            [nombre]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async crear(datosLogro: Logro): Promise<Logro> {
        const { nombre, descripcion, xp_recompensa, requisito } = datosLogro;
        const resultado = await pool.query(
            'INSERT INTO logro (nombre, descripcion, xp_recompensa, requisito) VALUES ($1, $2, $3, $4) RETURNING id_logro',
            [
                nombre, 
                descripcion || null, 
                xp_recompensa ?? 0.00, 
                requisito || null
            ]
        );

        return {
            id_logro: resultado.rows[0].id_logro,
            nombre,
            descripcion,
            xp_recompensa: xp_recompensa ?? 0.00,
            requisito,
            estado: true
        };
    }

    static async actualizar(id_logro: number, datosLogro: Partial<Logro>): Promise<boolean> {
        const { nombre, descripcion, xp_recompensa, requisito, estado } = datosLogro;
        const resultado = await pool.query(
            `UPDATE logro SET 
                nombre = COALESCE($1, nombre), 
                descripcion = COALESCE($2, descripcion), 
                xp_recompensa = COALESCE($3, xp_recompensa), 
                requisito = COALESCE($4, requisito), 
                estado = COALESCE($5, estado) 
            WHERE id_logro = $6`,
            [
                nombre || null, 
                descripcion || null, 
                xp_recompensa !== undefined ? xp_recompensa : null, 
                requisito || null, 
                estado !== undefined ? estado : null, 
                id_logro
            ]
        );
        return (resultado.rowCount ?? 0) > 0;
    }

    static async desactivar(id_logro: number): Promise<boolean> {
        const resultado = await pool.query(
            'UPDATE logro SET estado = FALSE WHERE id_logro = $1',
            [id_logro]
        );
        return (resultado.rowCount ?? 0) > 0;
    }
}