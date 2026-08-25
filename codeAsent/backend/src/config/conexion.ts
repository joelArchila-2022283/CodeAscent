import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'IN5CM',
    password: '?donmoA5m@',
    database: 'DBcodeAscent_in5cm',
    port: 3306
});

export const probarConexion = async (): Promise<void> => {
    try {
        const connection = await pool.getConnection();

        console.log('Conectado exitosamente a MySQL');

        connection.release();
    } catch (error) {
        console.error('Error al conectar con MySQL:');
        console.error(error);
    }
};