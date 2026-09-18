import { Router } from 'express';
import { obtenerNivelesSql } from '../controllers/sql.controller';

const router = Router();

router.get('/niveles', obtenerNivelesSql);

export default router;
