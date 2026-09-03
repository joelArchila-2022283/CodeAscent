import { Router } from 'express';
import { ControladorProgreso } from '../controllers/progreso.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.get('/', ControladorProgreso.obtenerTodos);
router.get('/:id', ControladorProgreso.obtenerPorId);
router.get('/usuario/:id_usuario', ControladorProgreso.obtenerPorUsuario);
router.get('/usuario/:id_usuario/lenguaje/:id_lenguaje', ControladorProgreso.obtenerPorUsuarioYLenguaje);

router.post('/', ControladorProgreso.crear);
router.put('/:id', ControladorProgreso.actualizar);

router.delete('/:id', esAdmin, ControladorProgreso.eliminar);

export default router;