import { Router } from 'express';
import { EjemploController } from '../controllers/ejemplo.controller';

const router = Router();

router.get('/',EjemploController.obtenerTodos);

router.get('/leccion/:id_leccion',EjemploController.obtenerPorLeccion);

router.get('/:id',EjemploController.obtenerPorId);

router.post('/',EjemploController.crear);

router.put('/:id',EjemploController.actualizar);

router.delete('/:id',EjemploController.eliminar);

export default router;