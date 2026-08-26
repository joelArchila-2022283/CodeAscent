import { ResultSetHeader } from 'mysql2';
import { pool } from '../config/conexion';
import { Logro, LogroRow } from './logro.interface';

export class ModeloLogro {

    static async obtenerTodos(): Promise<Logro[]> {
        const [filas] = await pool.query<LogroRow[]>(
            'SELECT id_logro, nombre, descripcion, xp_recompensa, requisito, estado FROM logro WHERE estado = TRUE'
        );
        return filas;
    }

    static async obtenerPorId(id_logro: number): Promise<Logro | null> {
        const [filas] = await pool.query<LogroRow[]>(
            'SELECT id_logro, nombre, descripcion, xp_recompensa, requisito, estado FROM logro WHERE id_logro = ? AND estado = TRUE',
            [id_logro]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async obtenerPorNombre(nombre: string): Promise<Logro | null> {
        const [filas] = await pool.query<LogroRow[]>(
            'SELECT id_logro, nombre, descripcion, xp_recompensa, requisito, estado FROM logro WHERE nombre = ?',
            [nombre]
        );
        return filas.length > 0 ? filas[0] : null;
    }

    static async crear(datosLogro: Logro): Promise<Logro> {
        const { nombre, descripcion, xp_recompensa, requisito } = datosLogro;
        const [resultado] = await pool.query<ResultSetHeader>(
            'INSERT INTO logro (nombre, descripcion, xp_recompensa, requisito) VALUES (?, ?, ?, ?)',
            [nombre, descripcion || null, xp_recompensa ?? 0, requisito || null]
        );

        return {
            id_logro: resultado.insertId,
            nombre,
            descripcion: descripcion || null,
            xp_recompensa: xp_recompensa ?? 0,
            requisito: requisito || null,
            estado: true
        };
    }

    static async actualizar(id_logro: number, datosLogro: Partial<Logro>): Promise<boolean> {
        const { nombre, descripcion, xp_recompensa, requisito, estado } = datosLogro;
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE logro SET nombre = COALESCE(?, nombre), descripcion = COALESCE(?, descripcion), xp_recompensa = COALESCE(?, xp_recompensa), requisito = COALESCE(?, requisito), estado = COALESCE(?, estado) WHERE id_logro = ?',
            [
                nombre || null,
                descripcion || null,
                xp_recompensa !== undefined ? xp_recompensa : null,
                requisito || null,
                estado !== undefined ? estado : null,
                id_logro
            ]
        );

        return resultado.affectedRows > 0;
    }

    static async desactivar(id_logro: number): Promise<boolean> {
        const [resultado] = await pool.query<ResultSetHeader>(
            'UPDATE logro SET estado = FALSE WHERE id_logro = ?',
            [id_logro]
        );

        return resultado.affectedRows > 0;
    }

}