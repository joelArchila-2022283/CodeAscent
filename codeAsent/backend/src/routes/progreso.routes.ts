import { Router } from 'express';
import { ControladorProgreso } from '../controllers/progreso.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const router = Router();
router.get('/', ControladorProgreso.obtenerTodos);
router.get('/usuario/:id_usuario', verificarAutenticacion, ControladorProgreso.obtenerPorUsuario);
router.get('/usuario/:id_usuario/lenguaje/:id_lenguaje', verificarAutenticacion, ControladorProgreso.obtenerPorUsuarioYLenguaje);
router.get('/:id', ControladorProgreso.obtenerPorId);
router.post('/', ControladorProgreso.crear);
router.put('/:id', ControladorProgreso.actualizar);
router.delete('/:id', ControladorProgreso.eliminar);

export default router;