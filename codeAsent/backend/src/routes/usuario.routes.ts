import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

// Registro público (Crear usuario / Sign up)
router.post('/', UsuarioController.crear);

// A partir de aquí se requiere estar autenticado
router.use(verificarAutenticacion);

router.get('/', UsuarioController.obtenerTodos);
router.get('/:id', UsuarioController.obtenerPorId);
router.put('/:id', UsuarioController.actualizar);

router.delete('/:id', esAdmin, UsuarioController.eliminar);

export default router;