import { Router } from 'express';
import { ControladorNivel } from '../controllers/nivel.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.get('/', ControladorNivel.obtenerTodos);
router.get('/:id', ControladorNivel.obtenerPorId);
router.get('/lenguaje/:id_lenguaje', ControladorNivel.obtenerPorLenguaje);

router.post('/', esAdmin, ControladorNivel.crear);
router.put('/:id', esAdmin, ControladorNivel.actualizar);
router.delete('/:id', esAdmin, ControladorNivel.desactivar);

export default router;