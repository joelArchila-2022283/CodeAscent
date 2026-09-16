import { Router } from 'express';
import { obtenerResumenDashboard } from '../controllers/dashboard.controller';

const enrutadorDashboard = Router();

enrutadorDashboard.get('/resumen', obtenerResumenDashboard);

export default enrutadorDashboard;