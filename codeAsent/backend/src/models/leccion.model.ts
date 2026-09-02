import { pool } from '../config/conexion';
import { ILeccion, ILeccionRow } from '../interfaces/leccion.interface';

export class ModeloLeccion {

    static async obtenerTodas(): Promise<ILeccion[]> {
        const resultado = await pool.query<ILeccionRow>(
            'SELECT id_leccion, id_nivel, titulo, contenido, orden, estado FROM leccion WHERE estado = TRUE ORDER BY id_nivel ASC, orden ASC'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_leccion: number): Promise<ILeccion | null> {
        const resultado = await pool.query<ILeccionRow>(
            'SELECT id_leccion, id_nivel, titulo, contenido, orden, estado FROM leccion WHERE id_leccion = $1 AND estado = TRUE',
            [id_leccion]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorNivel(id_nivel: number): Promise<ILeccion[]> {
        const resultado = await pool.query<ILeccionRow>(
            'SELECT id_leccion, id_nivel, titulo, contenido, orden, estado FROM leccion WHERE id_nivel = $1 AND estado = TRUE ORDER BY orden ASC',
            [id_nivel]
        );
        return resultado.rows;
    }

    static async crear(datosLeccion: ILeccion): Promise<ILeccion> {
        const { id_nivel, titulo, contenido, orden } = datosLeccion;
        const resultado = await pool.query(
            'INSERT INTO leccion (id_nivel, titulo, contenido, orden) VALUES ($1, $2, $3, $4) RETURNING id_leccion',
            [id_nivel, titulo, contenido, orden]
        );

        return {
            id_leccion: resultado.rows[0].id_leccion,
            id_nivel,
            titulo,
            contenido,
            orden,
            estado: true
        };
    }

    static async actualizar(id_leccion: number, datosLeccion: Partial<ILeccion>): Promise<boolean> {
        const { id_nivel, titulo, contenido, orden, estado } = datosLeccion;
        const resultado = await pool.query(
            'UPDATE leccion SET id_nivel = COALESCE($1, id_nivel), titulo = COALESCE($2, titulo), contenido = COALESCE($3, contenido), orden = COALESCE($4, orden), estado = COALESCE($5, estado) WHERE id_leccion = $6',
            [
                id_nivel || null,
                titulo || null,
                contenido || null,
                orden !== undefined ? orden : null,
                estado !== undefined ? estado : null,
                id_leccion
            ]
        );
        return (resultado.rowCount ?? 0) > 0;
    }

    static async desactivar(id_leccion: number): Promise<boolean> {
        const resultado = await pool.query(
            'UPDATE leccion SET estado = FALSE WHERE id_leccion = $1',
            [id_leccion]
        );
        return (resultado.rowCount ?? 0) > 0;
    }
}