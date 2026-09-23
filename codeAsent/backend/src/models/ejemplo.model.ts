import { pool } from '../config/conexion';
import { IEjemplo, IEjemploRow } from '../interfaces/ejemplo.interface';

export class ModeloEjemplo {

    static async obtenerTodos(): Promise<IEjemplo[]> {
        const resultado = await pool.query<IEjemploRow>(
            'SELECT * FROM fn_obtener_ejemplos()'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_ejemplo: number): Promise<IEjemplo | null> {
        const resultado = await pool.query<IEjemploRow>(
            'SELECT * FROM fn_obtener_ejemplo_por_id($1)',
            [id_ejemplo]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IEjemplo[]> {
        const resultado = await pool.query<IEjemploRow>(
            'SELECT * FROM fn_obtener_ejemplos() WHERE id_leccion = $1',
            [id_leccion]
        );
        return resultado.rows;
    }

    static async crear(datosEjemplo: IEjemplo): Promise<boolean> {
        const { id_leccion, titulo, codigo, explicacion } = datosEjemplo;
        await pool.query(
            'CALL sp_crear_ejemplo($1, $2, $3, $4)',
            [id_leccion, titulo || null, codigo, explicacion || null]
        );
        return true;
    }

    static async actualizar(
        id_ejemplo: number,
        datosEjemplo: Partial<IEjemplo>
    ): Promise<boolean> {
        const ejemploActual = await this.obtenerPorId(id_ejemplo);
        if (!ejemploActual) return false;

        const titulo = datosEjemplo.titulo ?? ejemploActual.titulo;
        const codigo = datosEjemplo.codigo ?? ejemploActual.codigo;
        const explicacion = datosEjemplo.explicacion ?? ejemploActual.explicacion;

        await pool.query(
            'CALL sp_actualizar_ejemplo($1, $2, $3, $4)',
            [id_ejemplo, titulo, codigo, explicacion]
        );
        return true;
    }

    static async eliminar(id_ejemplo: number): Promise<boolean> {
        const ejemploActual = await this.obtenerPorId(id_ejemplo);
        if (!ejemploActual) return false;

        await pool.query(
            'CALL sp_eliminar_ejemplo($1)',
            [id_ejemplo]
        );
        return true;
    }
}