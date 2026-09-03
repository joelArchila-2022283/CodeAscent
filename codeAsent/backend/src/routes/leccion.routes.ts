import { Router } from 'express';
import { ControladorLeccion } from '../controllers/leccion.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.get('/', ControladorLeccion.obtenerTodas);
router.get('/:id', ControladorLeccion.obtenerPorId);
router.get('/nivel/:id_nivel', ControladorLeccion.obtenerPorNivel);
router.post('/', verificarAutenticacion, esAdmin, ControladorLeccion.crear);
router.put('/:id', ControladorLeccion.actualizar);
router.delete('/:id', ControladorLeccion.desactivar);

export default router;