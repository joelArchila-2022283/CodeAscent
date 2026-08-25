import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { INivel, INivelRow } from './nivel.interface';

export class ModeloNivel {

    static async obtenerTodos(): Promise<INivel[]> {
        const [filas] = await pool.query<INivelRow[]>(
            'SELECT id_nivel, id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado FROM nivel WHERE estado = TRUE'
        );
        return filas;
    }

    static async obtenerPorId(id_nivel: number): Promise<INivel | null> {
        const [filas] = await pool.query<INivelRow[]>(
            'SELECT id_nivel, id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado FROM nivel WHERE id_nivel = ? AND estado = TRUE',
            [id_nivel]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorLenguaje(id_lenguaje: number): Promise<INivel[]> {
        const [filas] = await pool.query<INivelRow[]>(
            'SELECT id_nivel, id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado FROM nivel WHERE id_lenguaje = ? AND estado = TRUE ORDER BY numero_nivel ASC',
            [id_lenguaje]
        );
        return filas;
    }

    static async crear(datosNivel: INivel): Promise<INivel> {
        const { id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida } = datosNivel;
        
        const [resultado] = await pool.query<ResultSetHeader>(
            'INSERT INTO nivel (id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida) VALUES (?, ?, ?, ?, ?)',
            [
                id_lenguaje,
                nombre,
                numero_nivel,
                descripcion || null,
                xp_requerida !== undefined ? xp_requerida : 0
            ]
        );

        return {
            id_nivel: resultado.insertId,
            id_lenguaje,
            nombre,
            numero_nivel,
            descripcion,
            xp_requerida: xp_requerida ?? 0,
            estado: true
        };
    }

    static async actualizar(id_nivel: number, datosNivel: Partial<INivel>): Promise<boolean> {
        const { id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado } = datosNivel;

        const [resultado] = await pool.query<ResultSetHeader>(
            `UPDATE nivel SET 
                id_lenguaje = COALESCE(?, id_lenguaje),
                nombre = COALESCE(?, nombre),
                numero_nivel = COALESCE(?, numero_nivel),
                descripcion = COALESCE(?, descripcion),
                xp_requerida = COALESCE(?, xp_requerida),
                estado = COALESCE(?, estado) 
             WHERE id_nivel = ?`,
            [
                id_lenguaje || null,
                nombre || null,
                numero_nivel || null,
                descripcion || null,
                xp_requerida !== undefined ? xp_requerida : null,
                estado !== undefined ? estado : null,
                id_nivel
            ]
        );

        return resultado.affectedRows > 0;
    }

    static async desactivar(id_nivel: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE nivel SET estado = FALSE WHERE id_nivel = ?',
            [id_nivel]
        );
        return resultado.affectedRows > 0;
    }
}