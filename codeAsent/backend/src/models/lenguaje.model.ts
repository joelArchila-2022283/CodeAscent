import { pool } from '../config/conexion'; // Se importa la constante 'pool' que creó tu compañero
import { ILenguaje, ILenguajeRow } from '../interfaces/lenguaje.interface';

export class ModeloLenguaje {

    static async obtenerTodos(): Promise<ILenguaje[]> {
        const resultado = await pool.query<ILenguajeRow>(
            'SELECT id_lenguaje, nombre, descripcion, estado FROM lenguaje WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_lenguaje: number): Promise<ILenguaje | null> {
        const resultado = await pool.query<ILenguajeRow>(
            'SELECT id_lenguaje, nombre, descripcion, estado FROM lenguaje WHERE id_lenguaje = $1 AND estado = TRUE',
            [id_lenguaje]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorNombre(nombre: string): Promise<ILenguaje | null> {
        const resultado = await pool.query<ILenguajeRow>(
            'SELECT id_lenguaje, nombre, descripcion, estado FROM lenguaje WHERE nombre = $1',
            [nombre]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async crear(datosLenguaje: ILenguaje): Promise<ILenguaje> {
        const { nombre, descripcion } = datosLenguaje;
        const resultado = await pool.query(
            'INSERT INTO lenguaje (nombre, descripcion) VALUES ($1, $2) RETURNING id_lenguaje',
            [nombre, descripcion || null]
        );

        return {
            id_lenguaje: resultado.rows[0].id_lenguaje,
            nombre,
            descripcion,
            estado: true
        };
    }

    static async actualizar(id_lenguaje: number, datosLenguaje: Partial<ILenguaje>): Promise<boolean> {
        const { nombre, descripcion, estado } = datosLenguaje;
        const resultado = await pool.query(
            'UPDATE lenguaje SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion), estado = COALESCE($3, estado) WHERE id_lenguaje = $4',
            [nombre || null, descripcion || null, estado !== undefined ? estado : null, id_lenguaje]
        );
        return (resultado.rowCount ?? 0) > 0;
    }

    static async desactivar(id_lenguaje: number): Promise<boolean> {
        const resultado = await pool.query(
            'UPDATE lenguaje SET estado = FALSE WHERE id_lenguaje = $1',
            [id_lenguaje]
        );
        return (resultado.rowCount ?? 0) > 0;
    }
}