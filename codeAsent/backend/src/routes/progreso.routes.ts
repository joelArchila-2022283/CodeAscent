import { Router } from 'express';
import { ControladorProgreso } from '../controllers/progreso.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const router = Router();

router.use(verificarAutenticacion);
router.get('/', ControladorProgreso.obtenerTodos);
router.get( '/usuario/:id_usuario', ControladorProgreso.obtenerPorUsuario);
router.get( '/usuario/:id_usuario/lenguaje/:id_lenguaje', ControladorProgreso.obtenerPorUsuarioYLenguaje);
router.get('/:id', ControladorProgreso.obtenerPorId);
router.post('/', ControladorProgreso.crear);
router.put('/:id', ControladorProgreso.actualizar);
router.delete('/:id', ControladorProgreso.eliminar);

export default router;