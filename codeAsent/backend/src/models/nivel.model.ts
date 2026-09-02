import { pool } from '../config/conexion';
import { INivel, INivelRow } from '../interfaces/nivel.interface';

export class ModeloNivel {

    static async obtenerTodos(): Promise<INivel[]> {
        const resultado = await pool.query<INivelRow>(
            'SELECT id_nivel, id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado FROM nivel WHERE estado = TRUE'
        );
        return resultado.rows;
    }

    static async obtenerPorId(id_nivel: number): Promise<INivel | null> {
        const resultado = await pool.query<INivelRow>(
            'SELECT id_nivel, id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado FROM nivel WHERE id_nivel = $1 AND estado = TRUE',
            [id_nivel]
        );
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    }

    static async obtenerPorLenguaje(id_lenguaje: number): Promise<INivel[]> {
        const resultado = await pool.query<INivelRow>(
            'SELECT id_nivel, id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado FROM nivel WHERE id_lenguaje = $1 AND estado = TRUE ORDER BY numero_nivel ASC',
            [id_lenguaje]
        );
        return resultado.rows;
    }

    static async crear(datosNivel: INivel): Promise<INivel> {
        const { id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida } = datosNivel;
        
        const resultado = await pool.query(
            'INSERT INTO nivel (id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida) VALUES ($1, $2, $3, $4, $5) RETURNING id_nivel',
            [
                id_lenguaje,
                nombre,
                numero_nivel,
                descripcion || null,
                xp_requerida !== undefined ? xp_requerida : 0
            ]
        );

        return {
            id_nivel: resultado.rows[0].id_nivel,
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

        const resultado = await pool.query(
            `UPDATE nivel SET 
                id_lenguaje = COALESCE($1, id_lenguaje),
                nombre = COALESCE($2, nombre),
                numero_nivel = COALESCE($3, numero_nivel),
                descripcion = COALESCE($4, descripcion),
                xp_requerida = COALESCE($5, xp_requerida),
                estado = COALESCE($6, estado) 
             WHERE id_nivel = $7`,
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

        return (resultado.rowCount ?? 0) > 0;
    }

    static async desactivar(id_nivel: number): Promise<boolean> {
        const resultado = await pool.query(
            'UPDATE nivel SET estado = FALSE WHERE id_nivel = $1',
            [id_nivel]
        );
        return (resultado.rowCount ?? 0) > 0;
    }
}