import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';
import * as bcrypt from 'bcryptjs';
import { generarToken } from '../utils/jwt.util';

export class UsuarioController {

    static async login(
        req: Request,
        res: Response
    ): Promise<void> {

        try {
            const { correo, password } = req.body;

            if (!correo || !password) {
                res.status(400).json({
                    mensaje: 'Correo y contraseña son obligatorios'
                });
                return;
            }

            const usuario = await UsuarioService.obtenerPorCorreo(correo);

            if (!usuario) {
                res.status(401).json({
                    mensaje: 'Correo o contraseña incorrectos'
                });
                return;
            }

            const passwordValida = await bcrypt.compare(
                password,
                usuario.password
            );

            if (!passwordValida) {
                res.status(401).json({
                    mensaje: 'Correo o contraseña incorrectos'
                });
                return;
            }

            const token = generarToken({
                id_usuario: usuario.id_usuario!,
                correo: usuario.correo,
                rol: usuario.rol || 'jugador'
            });

            res.status(200).json({
                mensaje: 'Inicio de sesión exitoso',
                token
            });

        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al iniciar sesión',
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

            const nuevoUsuario =
                await UsuarioService.crear(req.body);

            res.status(201).json({
                mensaje: 'Usuario creado correctamente',
                datos: nuevoUsuario
            });

        } catch (error) {

            res.status(400).json({
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
}