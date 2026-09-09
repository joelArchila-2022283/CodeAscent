import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'db_CodeAscent',
    port: Number(process.env.DB_PORT) || 5432
});

export const probarConexion = async (): Promise<void> => {
    try {
        const cliente = await pool.connect();
        console.log('Conectado exitosamente a PostgreSQL');
        cliente.release();
    } catch (error) {
        console.error('Error al conectar con PostgreSQL:');
        console.error(error);
    }
};
