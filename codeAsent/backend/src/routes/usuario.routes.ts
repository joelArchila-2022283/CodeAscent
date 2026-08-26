import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

const router = Router();

router.get( '/',UsuarioController.obtenerTodos);
router.get('/:id',UsuarioController.obtenerPorId);
router.post('/',UsuarioController.crear);
router.put('/:id',UsuarioController.actualizar);
router.delete('/:id',UsuarioController.eliminar);

export default router;