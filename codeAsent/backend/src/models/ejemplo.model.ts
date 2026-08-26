import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { IEjemplo, IEjemploRow } from './ejemplo.interface';

export class ModeloEjemplo {

    static async obtenerTodos(): Promise<IEjemplo[]> {
        const [filas] = await pool.query<IEjemploRow[]>(
            `SELECT 
                id_ejemplo,
                id_leccion,
                titulo,
                codigo,
                explicacion
            FROM ejemplo`
        );

        return filas;
    }

    static async obtenerPorId(id_ejemplo: number): Promise<IEjemplo | null> {
        const [filas] = await pool.query<IEjemploRow[]>(
            `SELECT 
                id_ejemplo,
                id_leccion,
                titulo,
                codigo,
                explicacion
            FROM ejemplo
            WHERE id_ejemplo = ?`,
            [id_ejemplo]
        );

        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IEjemplo[]> {
        const [filas] = await pool.query<IEjemploRow[]>(
            `SELECT 
                id_ejemplo,
                id_leccion,
                titulo,
                codigo,
                explicacion
            FROM ejemplo
            WHERE id_leccion = ?`,
            [id_leccion]
        );

        return filas;
    }

    static async crear(datosEjemplo: IEjemplo): Promise<IEjemplo> {

        const {
            id_leccion,
            titulo,
            codigo,
            explicacion
        } = datosEjemplo;

        const [resultado] = await pool.query<ResultSetHeader>(
            `INSERT INTO ejemplo
                (id_leccion, titulo, codigo, explicacion)
            VALUES (?, ?, ?, ?)`,
            [
                id_leccion,
                titulo || null,
                codigo,
                explicacion || null
            ]
        );

        return {
            id_ejemplo: resultado.insertId,
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

        const [resultado] = await pool.query<ResultSetHeader>(
            `UPDATE ejemplo
            SET
                id_leccion = COALESCE(?, id_leccion),
                titulo = COALESCE(?, titulo),
                codigo = COALESCE(?, codigo),
                explicacion = COALESCE(?, explicacion)
            WHERE id_ejemplo = ?`,
            [
                id_leccion ?? null,
                titulo ?? null,
                codigo ?? null,
                explicacion ?? null,
                id_ejemplo
            ]
        );

        return resultado.affectedRows > 0;
    }

    static async eliminar(id_ejemplo: number): Promise<boolean> {

        const [resultado] = await pool.query<ResultSetHeader>(
            `DELETE FROM ejemplo
            WHERE id_ejemplo = ?`,
            [id_ejemplo]
        );

        return resultado.affectedRows > 0;
    }
}