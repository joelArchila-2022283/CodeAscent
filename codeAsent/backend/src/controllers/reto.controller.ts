import { Request, Response } from 'express';
import { ServicioReto } from '../services/reto.service';

export class ControladorReto {

    static async obtenerTodos(_req: Request, res: Response): Promise<void> {
        try {
            const retos = await ServicioReto.obtenerTodos();
            res.status(200).json({ status: 'success', data: retos });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id_reto = Number(req.params.id);
            const reto = await ServicioReto.obtenerPorId(id_reto);
            res.status(200).json({ status: 'success', data: reto });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorLeccion(req: Request, res: Response): Promise<void> {
        try {
            const id_leccion = Number(req.params.id_leccion);
            const retos = await ServicioReto.obtenerPorLeccion(id_leccion);
            res.status(200).json({ status: 'success', data: retos });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async crear(req: Request, res: Response): Promise<void> {
        try {
            const nuevoReto = await ServicioReto.crear(req.body);
            res.status(201).json({ 
                status: 'success', 
                message: 'Reto creado correctamente', 
                data: nuevoReto 
            });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id_reto = Number(req.params.id);
            await ServicioReto.actualizar(id_reto, req.body);
            res.status(200).json({ status: 'success', message: 'Reto actualizado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async eliminarLogicamente(req: Request, res: Response): Promise<void> {
        try {
            const id_reto = Number(req.params.id);
            await ServicioReto.eliminarLogicamente(id_reto);
            res.status(200).json({ status: 'success', message: 'Reto desactivado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
}