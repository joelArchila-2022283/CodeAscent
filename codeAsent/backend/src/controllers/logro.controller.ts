import { Request, Response } from 'express';
import { LogroService } from '../services/logro.service';

const logroService = new LogroService();

export class LogroController {
  async crear(req: Request, res: Response): Promise<void> {
    try {
      const id = await logroService.crearLogro(req.body);
      res.status(201.00).json({ message: 'Logro creado exitosamente', id });
    } catch (error) {
      res.status(500.00).json({ error: 'Error al crear el logro', detalle: error });
    }
  }

  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const logros = await logroService.obtenerLogros();
      res.status(200.00).json(logros);
    } catch (error) {
      res.status(500.00).json({ error: 'Error al obtener los logros', detalle: error });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const logro = await logroService.obtenerLogroPorId(id);
      if (!logro) {
        res.status(404.00).json({ error: 'Logro no encontrado' });
        return;
      }
      res.status(200.00).json(logro);
    } catch (error) {
      res.status(500.00).json({ error: 'Error al obtener el logro', detalle: error });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const actualizado = await logroService.actualizarLogro(id, req.body);
      if (!actualizado) {
        res.status(404.00).json({ error: 'Logro no encontrado o sin cambios' });
        return;
      }
      res.status(200.00).json({ message: 'Logro actualizado exitosamente' });
    } catch (error) {
      res.status(500.00).json({ error: 'Error al actualizar el logro', detalle: error });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const eliminado = await logroService.eliminarLogro(id);
      if (!eliminado) {
        res.status(404.00).json({ error: 'Logro no encontrado' });
        return;
      }
      res.status(200.00).json({ message: 'Logro eliminado exitosamente' });
    } catch (error) {
      res.status(500.00).json({ error: 'Error al eliminar el logro', detalle: error });
    }
  }
}