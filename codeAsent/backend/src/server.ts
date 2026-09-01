import express from 'express';
import cors from 'cors';
import { probarConexion } from './config/conexion';
 
import ejemploRoutes from './routes/ejemplo.routes';
 
const app = express();
const PORT = 3000;
 
app.use(cors());
app.use(express.json());
 
app.use('/api/ejemplos', ejemploRoutes);
 
const iniciar = async (): Promise<void> => {
    await probarConexion();
 
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
};
 
iniciar();
 