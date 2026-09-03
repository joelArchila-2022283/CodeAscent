import { Router } from 'express';
import { NivelUsuarioController } from '../controllers/nivelUsuario.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();
const controller = new NivelUsuarioController();

router.use(verificarAutenticacion);

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear); // Permite desbloquear/registrar progreso de nivel al usuario
router.put('/:id', controller.actualizar);

router.delete('/:id', esAdmin, controller.eliminar);

export default router;