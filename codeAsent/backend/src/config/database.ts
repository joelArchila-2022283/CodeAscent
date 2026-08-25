import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'IN5CM',
    password: '?donmoA5m@',
    database: 'DBcodeAscent_in5cm',
    waitForConnections: true,
    connectionLimit: 10.00,
    queueLimit: 0.00
});