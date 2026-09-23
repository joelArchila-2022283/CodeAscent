import { pool } from '../config/conexion';

export interface LenguajeCatalogo {
    id_lenguaje: number;
    nombre: string;
    descripcion: string | null;
}

export class LanguageService {
    static async resolverPorSlug(slug: string): Promise<LenguajeCatalogo> {
        const nombre = slug.trim().toLowerCase();

        const resultado = await pool.query<LenguajeCatalogo>(
            `SELECT id_lenguaje, nombre, descripcion
             FROM lenguaje
             WHERE LOWER(nombre) = $1
               AND estado = TRUE`,
            [nombre]
        );

        if (resultado.rows.length !== 1) {
            const error = new Error('Lenguaje no encontrado.');
            (error as Error & { statusCode?: number }).statusCode = 404;
            throw error;
        }

        return resultado.rows[0];
    }
}