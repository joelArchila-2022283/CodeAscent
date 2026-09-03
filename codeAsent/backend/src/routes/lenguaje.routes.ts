import { Router } from 'express';
import { ControladorLenguaje } from '../controllers/lenguaje.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.get('/', ControladorLenguaje.obtenerTodos);
router.get('/:id', ControladorLenguaje.obtenerPorId);

router.post('/', esAdmin, ControladorLenguaje.crear);
router.put('/:id', esAdmin, ControladorLenguaje.actualizar);
router.delete('/:id', esAdmin, ControladorLenguaje.desactivar);

export default router;