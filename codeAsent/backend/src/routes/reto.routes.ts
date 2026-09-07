import { Router } from 'express';
import { ControladorReto } from '../controllers/reto.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

// Consultas públicas
router.get('/', ControladorReto.obtenerTodos);
router.get('/leccion/:id_leccion', ControladorReto.obtenerPorLeccion);
router.get('/:id', ControladorReto.obtenerPorId);

// Operaciones administrativas
router.post( '/', verificarAutenticacion,esAdmin,ControladorReto.crear);
router.put('/:id',verificarAutenticacion,esAdmin,ControladorReto.actualizar);
router.delete('/:id', verificarAutenticacion, esAdmin, ControladorReto.eliminarLogicamente);

export default router;