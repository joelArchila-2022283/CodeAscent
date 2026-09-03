import { pool } from '../config/conexion';
import { ILenguaje, ILenguajeRow } from '../interfaces/lenguaje.interface';

export class ModeloLenguaje {

    static async obtenerTodos(): Promise<ILenguaje[]> {
        const resultado = await pool.query<ILenguajeRow>(
            'SELECT * FROM fn_obtener_lenguajes() WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_lenguaje: number): Promise<ILenguaje | null> {
        const resultado = await pool.query<ILenguajeRow>(
            'SELECT * FROM fn_obtener_lenguaje_por_id($1)',
            [id_lenguaje]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorNombre(nombre: string): Promise<ILenguaje | null> {
        const resultado = await pool.query<ILenguajeRow>(
            'SELECT * FROM fn_obtener_lenguajes() WHERE nombre = $1',
            [nombre]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async crear(datosLenguaje: ILenguaje): Promise<boolean> {
        const { nombre, descripcion, estado } = datosLenguaje;
        await pool.query(
            'CALL sp_crear_lenguaje($1, $2, $3)',
            [nombre, descripcion || null, estado ?? true]
        );
        return true;
    }

    static async actualizar(id_lenguaje: number, datosLenguaje: Partial<ILenguaje>): Promise<boolean> {
        const lenguajeActual = await this.obtenerPorId(id_lenguaje);
        if (!lenguajeActual) return false;

        const nombre = datosLenguaje.nombre ?? lenguajeActual.nombre;
        const descripcion = datosLenguaje.descripcion ?? lenguajeActual.descripcion;
        const estado = datosLenguaje.estado ?? lenguajeActual.estado ?? true;

        await pool.query(
            'CALL sp_actualizar_lenguaje($1, $2, $3, $4)',
            [id_lenguaje, nombre, descripcion, estado]
        );
        return true;
    }

    static async desactivar(id_lenguaje: number): Promise<boolean> {
        const lenguajeActual = await this.obtenerPorId(id_lenguaje);
        if (!lenguajeActual) return false;

        await pool.query(
            'CALL sp_actualizar_lenguaje($1, $2, $3, $4)',
            [id_lenguaje, lenguajeActual.nombre, lenguajeActual.descripcion, false]
        );
        return true;
    }
}