import { Router } from 'express';
import { ControladorReto } from '../controllers/reto.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.get('/', ControladorReto.obtenerTodos);
router.get('/:id', ControladorReto.obtenerPorId);
router.get('/leccion/:id_leccion', ControladorReto.obtenerPorLeccion);
router.post('/', ControladorReto.crear);
router.put('/:id', verificarAutenticacion, esAdmin, ControladorReto.actualizar);
router.delete('/:id', ControladorReto.eliminarLogicamente);

export default router;