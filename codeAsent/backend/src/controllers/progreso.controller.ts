import { Request, Response } from 'express';
import { ServicioProgreso } from '../services/progreso.service';

export class ControladorProgreso {

    static async obtenerTodos(_req: Request, res: Response): Promise<void> {
        try {
            const progresos = await ServicioProgreso.obtenerTodos();
            res.status(200).json({ status: 'success', data: progresos });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id_progreso = Number(req.params.id);
            const progreso = await ServicioProgreso.obtenerPorId(id_progreso);
            res.status(200).json({ status: 'success', data: progreso });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorUsuario(req: Request, res: Response): Promise<void> {
        try {
            const id_usuario = Number(req.params.id_usuario);
            const progresos = await ServicioProgreso.obtenerPorUsuario(id_usuario);
            res.status(200).json({ status: 'success', data: progresos });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorUsuarioYLenguaje(req: Request, res: Response): Promise<void> {
        try {
            const id_usuario = Number(req.params.id_usuario);
            const id_lenguaje = Number(req.params.id_lenguaje);
            const progreso = await ServicioProgreso.obtenerPorUsuarioYLenguaje(id_usuario, id_lenguaje);
            res.status(200).json({ status: 'success', data: progreso });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }

    static async crear(req: Request, res: Response): Promise<void> {
        try {
            const nuevoProgreso = await ServicioProgreso.crear(req.body);
            res.status(201).json({ 
                status: 'success', 
                message: 'Progreso registrado correctamente', 
                data: nuevoProgreso 
            });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id_progreso = Number(req.params.id);
            await ServicioProgreso.actualizar(id_progreso, req.body);
            res.status(200).json({ status: 'success', message: 'Progreso actualizado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async eliminar(req: Request, res: Response): Promise<void> {
        try {
            const id_progreso = Number(req.params.id);
            await ServicioProgreso.eliminar(id_progreso);
            res.status(200).json({ status: 'success', message: 'Registro de progreso eliminado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
}