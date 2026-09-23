import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('❌ ERROR CRÍTICO DE CONFIGURACIÓN:');
  console.error('Faltan variables de entorno obligatorias (DB_USER, DB_PASSWORD o DB_NAME).');
  process.exit(1);
}

export const pool = new Pool({
  host: DB_HOST || 'localhost',
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT) || 5432
});

export const probarConexion = async (): Promise<void> => {
  try {
    const cliente = await pool.connect();
    console.log('⚡ Conectado exitosamente a PostgreSQL');
    cliente.release();
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:');
    console.error(error);
  }
};