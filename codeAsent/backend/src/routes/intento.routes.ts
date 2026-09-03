import { Router } from 'express';
import { IntentoController } from '../controllers/intento.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const router = Router();

router.get('/',IntentoController.obtenerTodos);
router.get('/usuario/:id_usuario',IntentoController.obtenerPorUsuario);
router.get('/reto/:id_reto',IntentoController.obtenerPorReto);
router.get('/:id',IntentoController.obtenerPorId);
router.post('/', verificarAutenticacion, IntentoController.crear);
router.put( '/:id',IntentoController.actualizar);
router.delete('/:id',IntentoController.eliminar);

export default router;