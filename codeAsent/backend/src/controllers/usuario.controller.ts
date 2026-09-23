import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';
import { OAuth2Client } from 'google-auth-library';
import { CLAVE_SECRETA, generarToken } from '../utils/jwt.util';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
                const usuarioExiste = await UsuarioService.obtenerPorCorreo(correo);

                res.status(usuarioExiste ? 401 : 404).json({
                    exito: false,
                    mensaje: usuarioExiste
                        ? 'La contraseña es incorrecta.'
                        : 'Esta cuenta aún no está registrada.'
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
            const idAutenticado = req.usuario?.id_usuario;
            const nombre = typeof req.body.nombre === 'string'
                ? req.body.nombre.trim()
                : '';

            if (!idAutenticado || id_usuario !== idAutenticado) {
                res.status(403).json({ mensaje: 'Solo puedes actualizar tu propio usuario.' });
                return;
            }

            if (nombre.length < 3 || nombre.length > 100) {
                res.status(400).json({ mensaje: 'El usuario debe tener entre 3 y 100 caracteres.' });
                return;
            }

            await UsuarioService.actualizar(
                id_usuario,
                { nombre }
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
                    password: '',
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

    // Recuperacion de contraseña
    static async solicitarRecuperacion(req: Request, res: Response): Promise<void> {
        try {
            const correo = typeof req.body.correo === 'string' ? req.body.correo.trim().toLowerCase() : '';

            if (!correo) {
                res.status(400).json({ mensaje: 'El correo electrónico es obligatorio.' });
                return;
            }

            // 1. Usar el servicio que ya tienes para buscar al usuario
            const usuario = await UsuarioService.obtenerPorCorreo(correo);

            if (!usuario) {
                res.status(404).json({ mensaje: 'No existe una cuenta con este correo en CodeAscent.' });
                return;
            }

            // 2. Generar un token temporal que caduca en 15 minutos
            const tokenRecuperacion = jwt.sign(
                { id_usuario: usuario.id_usuario, correo: usuario.correo, tipo: 'recuperacion' },
                CLAVE_SECRETA,
                { expiresIn: '15m' }
            );

            // 3. Crear el enlace seguro hacia tu frontend
            const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, '');
            const enlace = `${frontendUrl}/restaurar-password?token=${encodeURIComponent(tokenRecuperacion)}`;

            // 4. Diseñar y enviar el correo con la temática de la cueva
            await transporter.sendMail({
                from: `"CodeAscent - Soporte Subterráneo" <${process.env.EMAIL_USER}>`,
                to: correo,
                subject: 'Recuperación de Núcleo - CodeAscent',
                html: `
                    <div style="background-color: #0c0908; color: #e6ded6; padding: 30px; font-family: sans-serif; border: 2px solid #42342c; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ff9100; text-align: center; font-size: 24px;">Restablecimiento de Credenciales</h2>
                        <p>Saludos, operador <strong>${usuario.nombre}</strong>.</p>
                        <p>Los sensores de la mina indican que solicitaste un restablecimiento de contraseña para tu cuenta.</p>
                        <p>Haz clic en el siguiente enlace para calibrar una nueva clave. Por seguridad, este enlace se autodestruirá en <strong>15 minutos</strong>:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${enlace}" style="background-color: #ff9100; color: #000; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">Restaurar Contraseña</a>
                        </div>
                        <p style="color: #9a8a80; font-size: 12px; text-align: center;">Si no solicitaste esto, ignora este mensaje y tu núcleo permanecerá seguro.</p>
                    </div>
                `
            });

            res.json({ mensaje: 'Directiva de recuperación enviada exitosamente.' });
        } catch (error) {
            console.error('Error al enviar correo:', error);
            res.status(500).json({ 
                mensaje: 'Error interno de los servidores de la mina.',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    static async actualizarPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, nuevaPassword } = req.body;

            if (typeof token !== 'string' || !token || typeof nuevaPassword !== 'string' || nuevaPassword.length < 6) {
                res.status(400).json({ mensaje: 'El token y una contraseña de al menos 6 caracteres son obligatorios.' });
                return;
            }

            let decodificado: { id_usuario?: number; tipo?: string };
            try {
                decodificado = jwt.verify(token, CLAVE_SECRETA) as typeof decodificado;
            } catch (err) {
                res.status(401).json({ mensaje: 'El enlace de recuperación ha caducado o es inválido.' });
                return;
            }

            if (decodificado.tipo !== 'recuperacion' || !Number.isInteger(decodificado.id_usuario)) {
                res.status(401).json({ mensaje: 'El enlace de recuperación ha caducado o es inválido.' });
                return;
            }

            await UsuarioService.actualizar(decodificado.id_usuario!, { password: nuevaPassword });

            res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error interno al actualizar la contraseña',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}
