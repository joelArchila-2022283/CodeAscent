import { Router } from 'express';
import { ControladorLeccion } from '../controllers/leccion.controller';

const router = Router();

router.get('/', ControladorLeccion.obtenerTodas);
router.get('/:id', ControladorLeccion.obtenerPorId);
router.get('/nivel/:id_nivel', ControladorLeccion.obtenerPorNivel);
router.post('/', ControladorLeccion.crear);
router.put('/:id', ControladorLeccion.actualizar);
router.delete('/:id', ControladorLeccion.desactivar);

export default router;