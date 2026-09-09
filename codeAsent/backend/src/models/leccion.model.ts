import { pool } from '../config/conexion';
import { ILeccion, ILeccionRow } from '../interfaces/leccion.interface';

export class ModeloLeccion {

    static async obtenerTodas(): Promise<ILeccion[]> {
        const resultado = await pool.query<ILeccionRow>(
            'SELECT * FROM fn_obtener_lecciones() WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_leccion: number): Promise<ILeccion | null> {
        const resultado = await pool.query<ILeccionRow>(
            'SELECT * FROM fn_obtener_leccion_por_id($1)',
            [id_leccion]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorNivel(id_nivel: number): Promise<ILeccion[]> {
        const resultado = await pool.query<ILeccionRow>(
            'SELECT * FROM fn_obtener_lecciones() WHERE id_nivel = $1 AND estado = TRUE',
            [id_nivel]
        );
        return resultado.rows;
    }

    static async crear(datosLeccion: ILeccion): Promise<boolean> {
        const { id_nivel, titulo, contenido, orden } = datosLeccion;
        await pool.query(
            'CALL sp_crear_leccion($1, $2, $3, $4)',
            [id_nivel, titulo, contenido, orden]
        );
        return true;
    }

    static async actualizar(id_leccion: number, datosLeccion: Partial<ILeccion>): Promise<boolean> {
        const leccionActual = await this.obtenerPorId(id_leccion);
        if (!leccionActual) return false;

        const titulo = datosLeccion.titulo ?? leccionActual.titulo;
        const contenido = datosLeccion.contenido ?? leccionActual.contenido;
        const orden = datosLeccion.orden ?? leccionActual.orden;
        const estado = datosLeccion.estado ?? leccionActual.estado ?? true;

        await pool.query(
            'CALL sp_actualizar_leccion($1, $2, $3, $4, $5)',
            [id_leccion, titulo, contenido, orden, estado]
        );
        return true;
    }

    static async desactivar(id_leccion: number): Promise<boolean> {
        const leccionActual = await this.obtenerPorId(id_leccion);
        if (!leccionActual) return false;

        await pool.query(
            'CALL sp_actualizar_leccion($1, $2, $3, $4, $5)',
            [id_leccion, leccionActual.titulo, leccionActual.contenido, leccionActual.orden, false]
        );
        return true;
    }
}