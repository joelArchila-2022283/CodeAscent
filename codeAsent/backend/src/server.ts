import express from 'express';
import cors from 'cors';
import path from 'path'; 
import { probarConexion } from './config/conexion';
import enrutadorPrincipal from './routes';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000; 
 
app.use(cors());
app.use(express.json());
 
app.use('/api', enrutadorPrincipal);

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});
 
const iniciar = async (): Promise<void> => {
    await probarConexion();
 
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
};
 
iniciar();
