import { pool } from '../config/database';
import { Logro } from '../models/logro.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class LogroService {
    async crearLogro(logro: Logro): Promise<number> {
    const { nombre, descripcion, xp_recompensa, requisito, estado } = logro;
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO logro (nombre, descripcion, xp_recompensa, requisito, estado) VALUES (?, ?, ?, ?, ?)',
        [nombre, descripcion, xp_recompensa ?? 0.00, requisito, estado ?? true]
    );
    return result.insertId;
    }

    async obtenerLogros(): Promise<Logro[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM logro');
    return rows as Logro[];
    }

    async obtenerLogroPorId(id: number): Promise<Logro | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM logro WHERE id_logro = ?', [id]);
    const logros = rows as Logro[];
    return logros.length > 0 ? logros[0] : null;
    }

    async actualizarLogro(id: number, logro: Partial<Logro>): Promise<boolean> {
    const { nombre, descripcion, xp_recompensa, requisito, estado } = logro;
    const [result] = await pool.query<ResultSetHeader>(
        'UPDATE logro SET nombre = ?, descripcion = ?, xp_recompensa = ?, requisito = ?, estado = ? WHERE id_logro = ?',
        [nombre, descripcion, xp_recompensa, requisito, estado, id]
    );
    return result.affectedRows > 0;
    }

    async eliminarLogro(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM logro WHERE id_logro = ?', [id]);
    return result.affectedRows > 0;
    }
}