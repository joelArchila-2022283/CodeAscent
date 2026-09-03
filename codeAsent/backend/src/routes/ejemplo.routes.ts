import { Router } from 'express';
import { EjemploController } from '../controllers/ejemplo.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.get('/', EjemploController.obtenerTodos);
router.get('/leccion/:id_leccion', EjemploController.obtenerPorLeccion);
router.get('/:id', EjemploController.obtenerPorId);

router.post('/', esAdmin, EjemploController.crear);
router.put('/:id', esAdmin, EjemploController.actualizar);
router.delete('/:id', esAdmin, EjemploController.eliminar);

export default router;