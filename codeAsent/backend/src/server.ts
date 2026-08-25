import { probarConexion } from './config/conexion';

const iniciar = async (): Promise<void> => {
    await probarConexion();

    console.log('Servidor de CodeAscent iniciado');
};

iniciar();