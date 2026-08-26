import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { ILeccion, ILeccionRow } from './leccion.interface';

export class ModeloLeccion {

    static async obtenerTodas(): Promise<ILeccion[]> {
        const [filas] = await pool.query<ILeccionRow[]>(
            'SELECT id_leccion, id_nivel, titulo, contenido, orden, estado FROM leccion WHERE estado = TRUE ORDER BY id_nivel ASC, orden ASC'
        );
        return filas;
    }

    static async obtenerPorId(id_leccion: number): Promise<ILeccion | null> {
        const [filas] = await pool.query<ILeccionRow[]>(
            'SELECT id_leccion, id_nivel, titulo, contenido, orden, estado FROM leccion WHERE id_leccion = ? AND estado = TRUE',
            [id_leccion]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorNivel(id_nivel: number): Promise<ILeccion[]> {
        const [filas] = await pool.query<ILeccionRow[]>(
            'SELECT id_leccion, id_nivel, titulo, contenido, orden, estado FROM leccion WHERE id_nivel = ? AND estado = TRUE ORDER BY orden ASC',
            [id_nivel]
        );
        return filas;
    }

    static async crear(datosLeccion: ILeccion): Promise<ILeccion> {
        const { id_nivel, titulo, contenido, orden } = datosLeccion;
        const [resultado] = await pool.query<ResultSetHeader>(
            'INSERT INTO leccion (id_nivel, titulo, contenido, orden) VALUES (?, ?, ?, ?)',
            [id_nivel, titulo, contenido, orden]
        );

        return {
            id_leccion: resultado.insertId,
            id_nivel,
            titulo,
            contenido,
            orden,
            estado: true
        };
    }

    static async actualizar(id_leccion: number, datosLeccion: Partial<ILeccion>): Promise<boolean> {
        const { id_nivel, titulo, contenido, orden, estado } = datosLeccion;
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE leccion SET id_nivel = COALESCE(?, id_nivel), titulo = COALESCE(?, titulo), contenido = COALESCE(?, contenido), orden = COALESCE(?, orden), estado = COALESCE(?, estado) WHERE id_leccion = ?',
            [
                id_nivel || null,
                titulo || null,
                contenido || null,
                orden !== undefined ? orden : null,
                estado !== undefined ? estado : null,
                id_leccion
            ]
        );
        return resultado.affectedRows > 0;
    }

    static async desactivar(id_leccion: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE leccion SET estado = FALSE WHERE id_leccion = ?',
            [id_leccion]
        );
        return resultado.affectedRows > 0;
    }
}