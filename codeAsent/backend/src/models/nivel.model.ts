import { pool } from '../config/conexion';
import { INivel, INivelRow } from '../interfaces/nivel.interface';

export class ModeloNivel {

    static async obtenerTodos(): Promise<INivel[]> {
        const resultado = await pool.query<INivelRow>(
            'SELECT * FROM fn_obtener_niveles() WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_nivel: number): Promise<INivel | null> {
        const resultado = await pool.query<INivelRow>(
            'SELECT * FROM fn_obtener_nivel_por_id($1)',
            [id_nivel]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorLenguaje(id_lenguaje: number): Promise<INivel[]> {
        const resultado = await pool.query<INivelRow>(
            'SELECT * FROM fn_obtener_niveles() WHERE id_lenguaje = $1 AND estado = TRUE ORDER BY numero_nivel ASC',
            [id_lenguaje]
        );
        return resultado.rows;
    }

    static async crear(datosNivel: INivel & { nombre_lenguaje?: string }): Promise<boolean> {

        const { nombre_lenguaje, nombre, numero_nivel, descripcion, xp_requerida } = datosNivel;

        await pool.query(
            'CALL sp_crear_nivel($1, $2, $3, $4, $5)',
            [
                nombre_lenguaje || '',
                nombre,
                numero_nivel,
                descripcion || null,
                xp_requerida ?? 0
            ]
        );
        return true;
    }

    static async actualizar(id_nivel: number, datosNivel: Partial<INivel>): Promise<boolean> {
        const nivelActual = await this.obtenerPorId(id_nivel);
        if (!nivelActual) return false;

        const nombre = datosNivel.nombre ?? nivelActual.nombre;
        const numero_nivel = datosNivel.numero_nivel ?? nivelActual.numero_nivel;
        const descripcion = datosNivel.descripcion ?? nivelActual.descripcion;
        const xp_requerida = datosNivel.xp_requerida ?? nivelActual.xp_requerida;
        const estado = datosNivel.estado ?? nivelActual.estado ?? true;

        await pool.query(
            'CALL sp_actualizar_nivel($1, $2, $3, $4, $5, $6)',
            [id_nivel, nombre, numero_nivel, descripcion, xp_requerida, estado]
        );
        return true;
    }

    static async desactivar(id_nivel: number): Promise<boolean> {
        const nivelActual = await this.obtenerPorId(id_nivel);
        if (!nivelActual) return false;

        await pool.query(
            'CALL sp_actualizar_nivel($1, $2, $3, $4, $5, $6)',
            [id_nivel, nivelActual.nombre, nivelActual.numero_nivel, nivelActual.descripcion, nivelActual.xp_requerida, false]
        );
        return true;
    }
}