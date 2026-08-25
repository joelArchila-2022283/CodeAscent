import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tu_base_de_datos',
    waitForConnections: true,
    connectionLimit: 10.00,
    queueLimit: 0.00
});