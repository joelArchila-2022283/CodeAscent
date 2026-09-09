import { Router } from 'express';
import { RespuestaController } from '../controllers/respuesta.controller';

const router = Router();
const controller = new RespuestaController();

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;