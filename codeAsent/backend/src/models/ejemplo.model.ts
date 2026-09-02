import { pool } from '../config/conexion';
import { IEjemplo, IEjemploRow } from '../interfaces/ejemplo.interface';

export class ModeloEjemplo {

    static async obtenerTodos(): Promise<IEjemplo[]> {
        const resultado = await pool.query<IEjemploRow>(
            `SELECT 
                id_ejemplo,
                id_leccion,
                titulo,
                codigo,
                explicacion
            FROM ejemplo`
        );

        return resultado.rows;
    }

    static async obtenerPorId(id_ejemplo: number): Promise<IEjemplo | null> {
        const resultado = await pool.query<IEjemploRow>(
            `SELECT 
                id_ejemplo,
                id_leccion,
                titulo,
                codigo,
                explicacion
            FROM ejemplo
            WHERE id_ejemplo = $1`,
            [id_ejemplo]
        );

        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IEjemplo[]> {
        const resultado = await pool.query<IEjemploRow>(
            `SELECT 
                id_ejemplo,
                id_leccion,
                titulo,
                codigo,
                explicacion
            FROM ejemplo
            WHERE id_leccion = $1`,
            [id_leccion]
        );

        return resultado.rows;
    }

    static async crear(datosEjemplo: IEjemplo): Promise<IEjemplo> {

        const {
            id_leccion,
            titulo,
            codigo,
            explicacion
        } = datosEjemplo;

        const resultado = await pool.query(
            `INSERT INTO ejemplo
                (id_leccion, titulo, codigo, explicacion)
            VALUES ($1, $2, $3, $4) RETURNING id_ejemplo`,
            [
                id_leccion,
                titulo || null,
                codigo,
                explicacion || null
            ]
        );

        return {
            id_ejemplo: resultado.rows[0].id_ejemplo,
            id_leccion,
            titulo,
            codigo,
            explicacion
        };
    }

    static async actualizar(
        id_ejemplo: number,
        datosEjemplo: Partial<IEjemplo>
    ): Promise<boolean> {

        const {
            id_leccion,
            titulo,
            codigo,
            explicacion
        } = datosEjemplo;

        const resultado = await pool.query(
            `UPDATE ejemplo
            SET
                id_leccion = COALESCE($1, id_leccion),
                titulo = COALESCE($2, titulo),
                codigo = COALESCE($3, codigo),
                explicacion = COALESCE($4, explicacion)
            WHERE id_ejemplo = $5`,
            [
                id_leccion ?? null,
                titulo ?? null,
                codigo ?? null,
                explicacion ?? null,
                id_ejemplo
            ]
        );

        return (resultado.rowCount ?? 0) > 0;
    }

    static async eliminar(id_ejemplo: number): Promise<boolean> {

        const resultado = await pool.query(
            `DELETE FROM ejemplo
            WHERE id_ejemplo = $1`,
            [id_ejemplo]
        );

        return (resultado.rowCount ?? 0) > 0;
    }
}