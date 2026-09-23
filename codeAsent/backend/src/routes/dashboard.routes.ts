import { Router } from 'express';
import { obtenerResumenDashboard } from '../controllers/dashboard.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const enrutadorDashboard = Router();

enrutadorDashboard.get('/resumen', verificarAutenticacion, obtenerResumenDashboard);

export default enrutadorDashboard;