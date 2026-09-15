import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';
import { OAuth2Client } from 'google-auth-library';
import { generarToken } from '../utils/jwt.util';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class UsuarioController {

    static async login(
        req: Request,
        res: Response
    ): Promise<void> {

        try {
            const correo = req.body.correo;
            const contrasena = req.body.contrasena || req.body.password;

            if (!correo || !contrasena) {
                res.status(400).json({
                    exito: false,
                    mensaje: 'Correo y contraseña son obligatorios'
                });
                return;
            }

            const resultado = await UsuarioService.iniciarSesion(
                correo,
                contrasena
            );

            if (!resultado) {
                res.status(401).json({
                    exito: false,
                    mensaje: 'Correo o contraseña incorrectos'
                });
                return;
            }

            res.status(200).json({
                exito: true,
                mensaje: 'Inicio de sesión exitoso',
                datos: resultado
            });

        } catch (error) {
            res.status(500).json({
                exito: false,
                mensaje: 'Error interno del servidor al iniciar sesión',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido'
            });
        }
    }

    static async obtenerTodos(
        req: Request,
        res: Response
    ): Promise<void> {

        try {
            const usuarios = await UsuarioService.obtenerTodos();

            res.status(200).json({
                mensaje: 'Usuarios obtenidos correctamente',
                datos: usuarios
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener los usuarios',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido'
            });
        }
    }

    static async obtenerPorId(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_usuario = Number(req.params.id);

            const usuario =
                await UsuarioService.obtenerPorId(id_usuario);

            if (!usuario) {
                res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });

                return;
            }

            res.status(200).json({
                mensaje: 'Usuario obtenido correctamente',
                datos: usuario
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener el usuario',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido'
            });
        }
    }

    static async crear(
        req: Request,
        res: Response
    ): Promise<void> {

        try {
            // 1. Extraemos el correo que viene del frontend
            const { correo } = req.body;

            // 2. Verificamos si ya existe un usuario con ese correo en la base de datos
            const usuarioExistente = await UsuarioService.obtenerPorCorreo(correo);

            if (usuarioExistente) {
                // Si existe, detenemos el proceso y enviamos un error 400 (Bad Request)
                res.status(400).json({
                    exito: false,
                    mensaje: 'Este correo electrónico ya está registrado. Intenta iniciar sesión.'
                });
                return;
            }

            // 3. Si el correo está libre, procedemos a crearlo
            const nuevoUsuario = await UsuarioService.crear(req.body);

            res.status(201).json({
                exito: true,
                mensaje: 'Usuario creado correctamente',
                datos: nuevoUsuario
            });

        } catch (error) {

            res.status(400).json({
                exito: false,
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al crear usuario'
            });
        }
    }

    static async actualizar(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_usuario = Number(req.params.id);

            await UsuarioService.actualizar(
                id_usuario,
                req.body
            );

            res.status(200).json({
                mensaje: 'Usuario actualizado correctamente'
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al actualizar usuario'
            });
        }
    }

    static async eliminar(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_usuario = Number(req.params.id);

            await UsuarioService.eliminar(id_usuario);

            res.status(200).json({
                mensaje: 'Usuario eliminado correctamente'
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al eliminar usuario'
            });
        }
    }
    
    static async loginConGoogle(req: Request, res: Response): Promise<void> {
        try {
            const { idToken } = req.body;

            // 1. Validar el token con los servidores de Google
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                res.status(400).json({ exito: false, mensaje: 'Token de Google no válido' });
                return;
            }

            // 2. Verificar si el usuario ya existe en PostgreSQL
            let usuario = await UsuarioService.obtenerPorCorreo(payload.email);

            // 3. Si no existe, lo creamos automáticamente
            if (!usuario) {
                usuario = await UsuarioService.crear({
                    nombre: payload.name || 'Jugador Google',
                    correo: payload.email,
                    password: '', // No requiere password local
                    rol: 'jugador'
                });
            }

            // 4. Generar el JWT de Code Ascent
            const token = generarToken({
                id_usuario: usuario.id_usuario!,
                correo: usuario.correo,
                rol: usuario.rol ?? 'jugador'
            });

            const { password, ...usuarioSinPassword } = usuario;

            res.status(200).json({
                exito: true,
                mensaje: 'Autenticación con Google exitosa',
                datos: { token, usuario: usuarioSinPassword }
            });

        } catch (error) {
            res.status(500).json({
                exito: false,
                mensaje: 'Error al verificar credencial de Google',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}