import { Router } from 'express';
import { completarCuestionarioCss, obtenerNivelesCss, registrarIntentoCss } from '../controllers/css.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const router = Router();

router.get('/niveles', obtenerNivelesCss);
router.post('/retos/:id_reto/intentos', verificarAutenticacion, registrarIntentoCss);
router.post('/lecciones/:id_leccion/completar-cuestionario', verificarAutenticacion, completarCuestionarioCss);

export default router;
