import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion'; // Se importa la constante 'pool' que creó tu compañero
import { ILenguaje, ILenguajeRow } from './lenguaje.interface';

export class ModeloLenguaje {

    static async obtenerTodos(): Promise<ILenguaje[]> {
        const [filas] = await pool.query<ILenguajeRow[]>(
            'SELECT id_lenguaje, nombre, descripcion, estado FROM lenguaje WHERE estado = TRUE'
        );
        return filas;
    }

    static async obtenerPorId(id_lenguaje: number): Promise<ILenguaje | null> {
        const [filas] = await pool.query<ILenguajeRow[]>(
            'SELECT id_lenguaje, nombre, descripcion, estado FROM lenguaje WHERE id_lenguaje = ? AND estado = TRUE',
            [id_lenguaje]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorNombre(nombre: string): Promise<ILenguaje | null> {
        const [filas] = await pool.query<ILenguajeRow[]>(
            'SELECT id_lenguaje, nombre, descripcion, estado FROM lenguaje WHERE nombre = ?',
            [nombre]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async crear(datosLenguaje: ILenguaje): Promise<ILenguaje> {
        const { nombre, descripcion } = datosLenguaje;
        const [resultado] = await pool.query<ResultSetHeader>(
            'INSERT INTO lenguaje (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || null]
        );

        return {
            id_lenguaje: resultado.insertId,
            nombre,
            descripcion,
            estado: true
        };
    }

    static async actualizar(id_lenguaje: number, datosLenguaje: Partial<ILenguaje>): Promise<boolean> {
        const { nombre, descripcion, estado } = datosLenguaje;
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE lenguaje SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion), estado = COALESCE(?, estado) WHERE id_lenguaje = ?',
            [nombre || null, descripcion || null, estado !== undefined ? estado : null, id_lenguaje]
        );
        return resultado.affectedRows > 0;
    }

    static async desactivar(id_lenguaje: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE lenguaje SET estado = FALSE WHERE id_lenguaje = ?',
            [id_lenguaje]
        );
        return resultado.affectedRows > 0;
    }
}