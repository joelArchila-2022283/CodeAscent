import { Request, Response } from 'express';
import { RespuestaService } from '../services/respuesta.service';

const servicio = new RespuestaService();

export class RespuestaController {

    async listar(_req: Request, res: Response): Promise<void> {
        try {
            const resultados = await servicio.obtenerTodas();
            res.status(200.00).json(resultados);
        } catch (error) {
            res.status(500.00).json({ error: 'Error al obtener las respuestas', detalle: error });
        }
    }

    async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const resultado = await servicio.obtenerPorId(id);
            if (!resultado) {
                res.status(404.00).json({ error: 'Respuesta no encontrada' });
                return;
            }
            res.status(200.00).json(resultado);
        } catch (error) {
            res.status(500.00).json({ error: 'Error al obtener la respuesta', detalle: error });
        }
    }

    async crear(req: Request, res: Response): Promise<void> {
        try {
            const nuevo = await servicio.crear(req.body);
            res.status(201.00).json({ message: 'Respuesta creada exitosamente', data: nuevo });
        } catch (error) {
            res.status(500.00).json({ error: 'Error al crear la respuesta', detalle: error });
        }
    }

    async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const actualizado = await servicio.actualizar(id, req.body);
            if (!actualizado) {
                res.status(404.00).json({ error: 'Respuesta no encontrada o sin cambios' });
                return;
            }
            res.status(200.00).json({ message: 'Respuesta actualizada exitosamente' });
        } catch (error) {
            res.status(500.00).json({ error: 'Error al actualizar la respuesta', detalle: error });
        }
    }

    async eliminar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const eliminado = await servicio.eliminar(id);
            if (!eliminado) {
                res.status(404.00).json({ error: 'Respuesta no encontrada' });
                return;
            }
            res.status(200.00).json({ message: 'Respuesta eliminada exitosamente' });
        } catch (error) {
            res.status(500.00).json({ error: 'Error al eliminar la respuesta', detalle: error });
        }
    }

}