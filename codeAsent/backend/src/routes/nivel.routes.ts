import { Router } from 'express';
import { ControladorNivel } from '../controllers/nivel.controller';

const router = Router();

router.get('/', ControladorNivel.obtenerTodos);
router.get('/:id', ControladorNivel.obtenerPorId);
router.get('/lenguaje/:id_lenguaje', ControladorNivel.obtenerPorLenguaje);
router.post('/', ControladorNivel.crear);
router.put('/:id', ControladorNivel.actualizar);
router.delete('/:id', ControladorNivel.desactivar);

export default router;