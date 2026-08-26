import { Request, Response } from 'express';
import { IntentoService } from '../services/intento.service';

export class IntentoController {

    static async obtenerTodos(
        req: Request,
        res: Response
    ): Promise<void> {

        try {
            const intentos = await IntentoService.obtenerTodos();

            res.status(200).json({
                mensaje: 'Intentos obtenidos correctamente',
                datos: intentos
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener los intentos',
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

            const id_intento = Number(req.params.id);

            const intento =
                await IntentoService.obtenerPorId(id_intento);

            if (!intento) {
                res.status(404).json({
                    mensaje: 'Intento no encontrado'
                });

                return;
            }

            res.status(200).json({
                mensaje: 'Intento obtenido correctamente',
                datos: intento
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener el intento',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido'
            });
        }
    }


    static async obtenerPorUsuario(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_usuario = Number(req.params.id_usuario);

            const intentos =
                await IntentoService.obtenerPorUsuario(id_usuario);

            res.status(200).json({
                mensaje: 'Intentos del usuario obtenidos correctamente',
                datos: intentos
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener los intentos del usuario',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido'
            });
        }
    }


    static async obtenerPorReto(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_reto = Number(req.params.id_reto);

            const intentos =
                await IntentoService.obtenerPorReto(id_reto);

            res.status(200).json({
                mensaje: 'Intentos del reto obtenidos correctamente',
                datos: intentos
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener los intentos del reto',
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

            const nuevoIntento =
                await IntentoService.crear(req.body);

            res.status(201).json({
                mensaje: 'Intento creado correctamente',
                datos: nuevoIntento
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al crear el intento'
            });
        }
    }


    static async actualizar(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_intento = Number(req.params.id);

            await IntentoService.actualizar(
                id_intento,
                req.body
            );

            res.status(200).json({
                mensaje: 'Intento actualizado correctamente'
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al actualizar el intento'
            });
        }
    }


    static async eliminar(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_intento = Number(req.params.id);

            await IntentoService.eliminar(id_intento);

            res.status(200).json({
                mensaje: 'Intento eliminado correctamente'
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al eliminar el intento'
            });
        }
    }
}