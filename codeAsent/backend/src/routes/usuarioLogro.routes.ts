import { Router } from 'express';
import { ControladorUsuarioLogro } from '../controllers/usuarioLogro.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

router.use(verificarAutenticacion);

router.get('/', ControladorUsuarioLogro.obtenerTodos);
router.get('/:id', ControladorUsuarioLogro.obtenerPorId);
router.get('/usuario/:id_usuario', ControladorUsuarioLogro.obtenerPorUsuario);

router.post('/', ControladorUsuarioLogro.asignarLogro);

router.delete('/:id', esAdmin, ControladorUsuarioLogro.eliminar);

export default router;