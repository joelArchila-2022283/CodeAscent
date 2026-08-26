import { Router } from 'express';
import { ControladorReto } from '../controllers/reto.controller';

const router = Router();

router.get('/', ControladorReto.obtenerTodos);
router.get('/:id', ControladorReto.obtenerPorId);
router.get('/leccion/:id_leccion', ControladorReto.obtenerPorLeccion);
router.post('/', ControladorReto.crear);
router.put('/:id', ControladorReto.actualizar);
router.delete('/:id', ControladorReto.eliminarLogicamente);

export default router;