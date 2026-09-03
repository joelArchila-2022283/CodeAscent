import { Router } from 'express';
import { ControladorReto } from '../controllers/reto.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.get('/', ControladorReto.obtenerTodos);
router.get('/:id', ControladorReto.obtenerPorId);
router.get('/leccion/:id_leccion', ControladorReto.obtenerPorLeccion);

router.post('/', esAdmin, ControladorReto.crear);
router.put('/:id', esAdmin, ControladorReto.actualizar);
router.delete('/:id', esAdmin, ControladorReto.eliminarLogicamente);

export default router;