import { Router } from 'express';
import { ControladorLeccion } from '../controllers/leccion.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

// Consultas públicas
router.get('/', ControladorLeccion.obtenerTodas);
router.get('/nivel/:id_nivel', ControladorLeccion.obtenerPorNivel);
router.get('/:id', ControladorLeccion.obtenerPorId);

// Operaciones administrativas
router.post(
    '/',
    verificarAutenticacion,
    esAdmin,
    ControladorLeccion.crear
);

router.put(
    '/:id',
    verificarAutenticacion,
    esAdmin,
    ControladorLeccion.actualizar
);

router.delete(
    '/:id',
    verificarAutenticacion,
    esAdmin,
    ControladorLeccion.desactivar
);

export default router;