import express from 'express';
import cors from 'cors';
import { probarConexion } from './config/conexion';
import enrutadorPrincipal from './routes';

const app = express();
const PORT = 3000;
 
app.use(cors());
app.use(express.json());
 
app.use('/api', enrutadorPrincipal);
 
const iniciar = async (): Promise<void> => {
    await probarConexion();
 
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
};
 
iniciar();
 