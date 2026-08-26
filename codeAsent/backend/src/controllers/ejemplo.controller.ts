 import { Request, Response } from 'express';
import { EjemploService } from '../services/ejemplo.service';

export class EjemploController {

    static async obtenerTodos(
        req: Request,
        res: Response
    ): Promise<void> {

        try {
            const ejemplos = await EjemploService.obtenerTodos();

            res.status(200).json({
                mensaje: 'Ejemplos obtenidos correctamente',
                datos: ejemplos
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener los ejemplos',
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

            const id_ejemplo = Number(req.params.id);

            const ejemplo =
                await EjemploService.obtenerPorId(id_ejemplo);

            if (!ejemplo) {
                res.status(404).json({
                    mensaje: 'Ejemplo no encontrado'
                });

                return;
            }

            res.status(200).json({
                mensaje: 'Ejemplo obtenido correctamente',
                datos: ejemplo
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener el ejemplo',
                error: error instanceof Error
                    ? error.message
                    : 'Error desconocido'
            });
        }
    }


    static async obtenerPorLeccion(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_leccion = Number(req.params.id_leccion);

            const ejemplos =
                await EjemploService.obtenerPorLeccion(id_leccion);

            res.status(200).json({
                mensaje: 'Ejemplos de la lección obtenidos correctamente',
                datos: ejemplos
            });

        } catch (error) {

            res.status(500).json({
                mensaje: 'Error al obtener los ejemplos de la lección',
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

            const nuevoEjemplo =
                await EjemploService.crear(req.body);

            res.status(201).json({
                mensaje: 'Ejemplo creado correctamente',
                datos: nuevoEjemplo
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al crear el ejemplo'
            });
        }
    }


    static async actualizar(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_ejemplo = Number(req.params.id);

            await EjemploService.actualizar(
                id_ejemplo,
                req.body
            );

            res.status(200).json({
                mensaje: 'Ejemplo actualizado correctamente'
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al actualizar el ejemplo'
            });
        }
    }


    static async eliminar(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const id_ejemplo = Number(req.params.id);

            await EjemploService.eliminar(id_ejemplo);

            res.status(200).json({
                mensaje: 'Ejemplo eliminado correctamente'
            });

        } catch (error) {

            res.status(400).json({
                mensaje: error instanceof Error
                    ? error.message
                    : 'Error al eliminar el ejemplo'
            });
        }
    }
}