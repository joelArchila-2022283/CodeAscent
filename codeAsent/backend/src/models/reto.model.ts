import { pool } from '../config/conexion';
import { IReto, IRetoRow } from './reto.interface';

export class ModeloReto {

    static async obtenerTodos(): Promise<IReto[]> {
        const resultado = await pool.query<IRetoRow>(
            'SELECT id_reto, id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado FROM reto WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_reto: number): Promise<IReto | null> {
        const resultado = await pool.query<IRetoRow>(
            'SELECT id_reto, id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado FROM reto WHERE id_reto = $1 AND estado = TRUE',
            [id_reto]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IReto[]> {
        const resultado = await pool.query<IRetoRow>(
            'SELECT id_reto, id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado FROM reto WHERE id_leccion = $1 AND estado = TRUE',
            [id_leccion]
        );
        return resultado.rows;
    }

    static async crear(reto: IReto): Promise<IReto> {
        const { id_leccion, titulo, descripcion, tipo_reto, xp_recompensa = 10, dificultad = 'facil' } = reto;
        const resultado = await pool.query(
            `INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado) 
             VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING id_reto`,
            [id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad]
        );

        return {
            id_reto: resultado.rows[0].id_reto,
            id_leccion,
            titulo,
            descripcion,
            tipo_reto,
            xp_recompensa,
            dificultad,
            estado: true
        };
    }

    static async actualizar(id_reto: number, reto: Partial<IReto>): Promise<boolean> {
        const { id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad } = reto;
        const resultado = await pool.query(
            `UPDATE reto 
             SET id_leccion = COALESCE($1, id_leccion),
                 titulo = COALESCE($2, titulo),
                 descripcion = COALESCE($3, descripcion),
                 tipo_reto = COALESCE($4, tipo_reto),
                 xp_recompensa = COALESCE($5, xp_recompensa),
                 dificultad = COALESCE($6, dificultad)
             WHERE id_reto = $7 AND estado = TRUE`,
            [id_leccion ?? null, titulo ?? null, descripcion ?? null, tipo_reto ?? null, xp_recompensa ?? null, dificultad ?? null, id_reto]
        );
        return (resultado.rowCount ?? 0) > 0;
    }

    static async eliminarLogicamente(id_reto: number): Promise<boolean> {
        const resultado = await pool.query(
            'UPDATE reto SET estado = FALSE WHERE id_reto = $1',
            [id_reto]
        );
        return (resultado.rowCount ?? 0) > 0;
    }
}