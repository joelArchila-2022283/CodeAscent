import { Router } from 'express';
import { obtenerNivelesCss, registrarIntentoCss } from '../controllers/css.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const router = Router();

router.get('/niveles', obtenerNivelesCss);
router.post('/retos/:id_reto/intentos', verificarAutenticacion, registrarIntentoCss);

export default router;
