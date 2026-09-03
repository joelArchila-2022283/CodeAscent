import { Router } from 'express';
import { LogroController } from '../controllers/logro.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();
const controller = new LogroController();

router.use(verificarAutenticacion);

router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);

router.post('/', esAdmin, controller.crear);
router.put('/:id', esAdmin, controller.actualizar);
router.delete('/:id', esAdmin, controller.eliminar);

export default router;