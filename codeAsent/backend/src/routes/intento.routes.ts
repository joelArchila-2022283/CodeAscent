import { Router } from 'express';
import { IntentoController } from '../controllers/intento.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.get('/', IntentoController.obtenerTodos);
router.get('/usuario/:id_usuario', IntentoController.obtenerPorUsuario);
router.get('/reto/:id_reto', IntentoController.obtenerPorReto);
router.get('/:id', IntentoController.obtenerPorId);
router.post('/', IntentoController.crear);

router.put('/:id', esAdmin, IntentoController.actualizar);
router.delete('/:id', esAdmin, IntentoController.eliminar);

export default router;