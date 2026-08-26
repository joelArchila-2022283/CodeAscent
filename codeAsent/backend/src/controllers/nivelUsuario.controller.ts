import { Request, Response } from 'express';
import { NivelUsuarioService } from '../services/nivelUsuario.service';

const servicio = new NivelUsuarioService();

export class NivelUsuarioController {

    async listar(_req: Request, res: Response): Promise<void> {
        try {
            const resultados = await servicio.obtenerTodos();
            res.status(200.00).json(resultados);
        } catch (error) {
            res.status(500.00).json({ error: 'Error al obtener los registros de nivel_usuario', detalle: error });
        }
    }

    async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const resultado = await servicio.obtenerPorId(id);
            if (!resultado) {
                res.status(404.00).json({ error: 'Registro no encontrado' });
                return;
            }
            res.status(200.00).json(resultado);
        } catch (error) {
            res.status(500.00).json({ error: 'Error al obtener el registro', detalle: error });
        }
    }

    async crear(req: Request, res: Response): Promise<void> {
        try {
            const nuevo = await servicio.crear(req.body);
            res.status(201.00).json({ message: 'Registro creado exitosamente', data: nuevo });
        } catch (error) {
            res.status(500.00).json({ error: 'Error al crear el registro', detalle: error });
        }
    }

    async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const actualizado = await servicio.actualizar(id, req.body);
            if (!actualizado) {
                res.status(404.00).json({ error: 'Registro no encontrado o sin cambios' });
                return;
            }
            res.status(200.00).json({ message: 'Registro actualizado exitosamente' });
        } catch (error) {
            res.status(500.00).json({ error: 'Error al actualizar el registro', detalle: error });
        }
    }

    async eliminar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const eliminado = await servicio.eliminar(id);
            if (!eliminado) {
                res.status(404.00).json({ error: 'Registro no encontrado' });
                return;
            }
            res.status(200.00).json({ message: 'Registro eliminado exitosamente' });
        } catch (error) {
            res.status(500.00).json({ error: 'Error al eliminar el registro', detalle: error });
        }
    }

}