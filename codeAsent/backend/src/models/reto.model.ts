import { pool } from '../config/conexion';
import { IReto, IRetoRow } from '../interfaces/reto.interface';

export class ModeloReto {

    static async obtenerTodos(): Promise<IReto[]> {
        const resultado = await pool.query<IRetoRow>(
            'SELECT * FROM fn_obtener_retos() WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_reto: number): Promise<IReto | null> {
        const resultado = await pool.query<IRetoRow>(
            'SELECT * FROM fn_obtener_reto_por_id($1)',
            [id_reto]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IReto[]> {
        const resultado = await pool.query<IRetoRow>(
            'SELECT * FROM fn_obtener_retos() WHERE id_leccion = $1 AND estado = TRUE',
            [id_leccion]
        );
        return resultado.rows;
    }

    static async crear(reto: IReto): Promise<boolean> {
        const { id_leccion, titulo, descripcion, tipo_reto, xp_recompensa = 10, dificultad = 'facil' } = reto;
        await pool.query(
            'CALL sp_crear_reto($1, $2, $3, $4, $5, $6)',
            [id_leccion, titulo, descripcion || null, tipo_reto, xp_recompensa, dificultad]
        );
        return true;
    }

    static async actualizar(id_reto: number, reto: Partial<IReto>): Promise<boolean> {
        const actual = await this.obtenerPorId(id_reto);
        if (!actual) return false;

        const id_leccion = reto.id_leccion ?? actual.id_leccion;
        const titulo = reto.titulo ?? actual.titulo;
        const descripcion = reto.descripcion ?? actual.descripcion;
        const tipo_reto = reto.tipo_reto ?? actual.tipo_reto;
        const xp_recompensa = reto.xp_recompensa ?? actual.xp_recompensa;
        const dificultad = reto.dificultad ?? actual.dificultad;
        const estado = reto.estado ?? actual.estado ?? true;

        await pool.query(
            'CALL sp_actualizar_reto($1, $2, $3, $4, $5, $6, $7, $8)',
            [id_reto, id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad, estado]
        );
        return true;
    }

    static async eliminarLogicamente(id_reto: number): Promise<boolean> {
        const actual = await this.obtenerPorId(id_reto);
        if (!actual) return false;

        await pool.query(
            'CALL sp_actualizar_reto($1, $2, $3, $4, $5, $6, $7, $8)',
            [id_reto, actual.id_leccion, actual.titulo, actual.descripcion, actual.tipo_reto, actual.xp_recompensa, actual.dificultad, false]
        );
        return true;
    }
}