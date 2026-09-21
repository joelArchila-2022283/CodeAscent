import { Router } from 'express';
import { obtenerNivelesSql, registrarRespuestaSql } from '../controllers/sql.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const router = Router();

router.use(verificarAutenticacion);
router.get('/niveles', obtenerNivelesSql);
router.post('/respuestas', registrarRespuestaSql);

export default router;
