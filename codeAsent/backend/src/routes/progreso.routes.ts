import { Router } from 'express';
import { ControladorProgreso } from '../controllers/progreso.controller';

const router = Router();
router.get('/', ControladorProgreso.obtenerTodos);
router.get('/:id', ControladorProgreso.obtenerPorId);
router.get('/usuario/:id_usuario', ControladorProgreso.obtenerPorUsuario);
router.get('/usuario/:id_usuario/lenguaje/:id_lenguaje', ControladorProgreso.obtenerPorUsuarioYLenguaje);
router.post('/', ControladorProgreso.crear);
router.put('/:id', ControladorProgreso.actualizar);
router.delete('/:id', ControladorProgreso.eliminar);

export default router;