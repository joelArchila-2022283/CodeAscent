import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { esAdmin } from '../middlewares/autorizacion.middleware';

const router = Router();

// Rutas públicas
router.post('/', UsuarioController.crear);
router.post('/login', UsuarioController.login);
router.post('/google', UsuarioController.loginConGoogle);

// Rutas de recuperación de contraseña
router.post('/recuperar', UsuarioController.solicitarRecuperacion);
router.post('/actualizar-password', UsuarioController.actualizarPassword);

// A partir de aquí se necesita JWT
router.use(verificarAutenticacion);

// Rutas privadas
router.get('/', UsuarioController.obtenerTodos);
router.get('/:id', UsuarioController.obtenerPorId);
router.put('/:id', UsuarioController.actualizar);

// Solo administrador
router.delete('/:id', esAdmin, UsuarioController.eliminar);

export default router;