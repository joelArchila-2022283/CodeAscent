import { Request, Response } from 'express';
import { ServicioLenguaje } from '../services/lenguaje.service';

export class ControladorLenguaje {

    static async obtenerTodos(_req: Request, res: Response): Promise<void> {
        try {
            const lenguajes = await ServicioLenguaje.obtenerTodos();
            res.status(200).json({ status: 'success', data: lenguajes });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id_lenguaje = Number(req.params.id);
            const lenguaje = await ServicioLenguaje.obtenerPorId(id_lenguaje);
            res.status(200).json({ status: 'success', data: lenguaje });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }

    static async crear(req: Request, res: Response): Promise<void> {
        try {
            const nuevoLenguaje = await ServicioLenguaje.crear(req.body);
            res.status(201).json({ 
                status: 'success', 
                message: 'Lenguaje creado correctamente', 
                data: nuevoLenguaje 
            });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id_lenguaje = Number(req.params.id);
            await ServicioLenguaje.actualizar(id_lenguaje, req.body);
            res.status(200).json({ status: 'success', message: 'Lenguaje actualizado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async desactivar(req: Request, res: Response): Promise<void> {
        try {
            const id_lenguaje = Number(req.params.id);
            await ServicioLenguaje.desactivar(id_lenguaje);
            res.status(200).json({ status: 'success', message: 'Lenguaje desactivado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
}