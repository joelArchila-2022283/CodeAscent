import { Router } from 'express';
import { ControladorUsuarioLogro } from '../controllers/usuarioLogro.controller';

const router = Router();

router.get('/', ControladorUsuarioLogro.obtenerTodos);
router.get('/:id', ControladorUsuarioLogro.obtenerPorId);
router.get('/usuario/:id_usuario', ControladorUsuarioLogro.obtenerPorUsuario);
router.post('/', ControladorUsuarioLogro.asignarLogro);
router.delete('/:id', ControladorUsuarioLogro.eliminar);

export default router;