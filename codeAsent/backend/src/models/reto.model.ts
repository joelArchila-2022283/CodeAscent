import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { IReto, IRetoRow } from './reto.interface';

export class ModeloReto {

    static async obtenerTodos(): Promise<IReto[]> {
        const [filas] = await pool.query<IRetoRow[]>(
            'SELECT id_reto, id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado FROM reto WHERE estado = TRUE'
        );
        return filas;
    }

    static async obtenerPorId(id_reto: number): Promise<IReto | null> {
        const [filas] = await pool.query<IRetoRow[]>(
            'SELECT id_reto, id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado FROM reto WHERE id_reto = ? AND estado = TRUE',
            [id_reto]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IReto[]> {
        const [filas] = await pool.query<IRetoRow[]>(
            'SELECT id_reto, id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado FROM reto WHERE id_leccion = ? AND estado = TRUE',
            [id_leccion]
        );
        return filas;
    }

    static async crear(reto: IReto): Promise<IReto> {
        const { id_leccion, titulo, descripcion, tipo_reto, xp_recompensa = 10, dificultad = 'facil' } = reto;
        const [resultado] = await pool.query<ResultSetHeader>(
            `INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado) 
             VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad]
        );

        return {
            id_reto: resultado.insertId,
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
        const [resultado] = await pool.query<ResultSetHeader>(
            `UPDATE reto 
             SET id_leccion = COALESCE(?, id_leccion),
                 titulo = COALESCE(?, titulo),
                 descripcion = COALESCE(?, descripcion),
                 tipo_reto = COALESCE(?, tipo_reto),
                 xp_recompensa = COALESCE(?, xp_recompensa),
                 dificultad = COALESCE(?, dificultad)
             WHERE id_reto = ? AND estado = TRUE`,
            [id_leccion ?? null, titulo ?? null, descripcion ?? null, tipo_reto ?? null, xp_recompensa ?? null, dificultad ?? null, id_reto]
        );
        return resultado.affectedRows > 0;
    }

    static async eliminarLogicamente(id_reto: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE reto SET estado = FALSE WHERE id_reto = ?',
            [id_reto]
        );
        return resultado.affectedRows > 0;
    }
}