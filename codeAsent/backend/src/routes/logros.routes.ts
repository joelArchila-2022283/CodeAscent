import { Router } from 'express';
import { LogroController } from '../controllers/logro.controller';

const router = Router();
const controller = new LogroController();

router.post('/', controller.crear);
router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;