import { Router } from 'express';
import { ControladorLenguaje } from '../controllers/lenguaje.controller';

const router = Router();


router.get('/', ControladorLenguaje.obtenerTodos);
router.get('/:id', ControladorLenguaje.obtenerPorId);
router.post('/', ControladorLenguaje.crear);
router.put('/:id', ControladorLenguaje.actualizar);
router.delete('/:id', ControladorLenguaje.desactivar);

export default router;