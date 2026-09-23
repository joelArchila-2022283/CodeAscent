import { Router } from 'express';
import { NivelUsuarioController } from '../controllers/nivelUsuario.controller';

const router = Router();
const controller = new NivelUsuarioController();

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;