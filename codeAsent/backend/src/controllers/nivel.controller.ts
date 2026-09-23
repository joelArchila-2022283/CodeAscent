import { Request, Response } from 'express';
import { ServicioNivel } from '../services/nivel.service';

export class ControladorNivel {
    static async obtenerTodos(_req: Request, res: Response): Promise<void> {
        try {
            const niveles = await ServicioNivel.obtenerTodos();
            res.status(200).json({ status: 'success', data: niveles });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id_nivel = Number(req.params.id);
            const nivel = await ServicioNivel.obtenerPorId(id_nivel);
            res.status(200).json({ status: 'success', data: nivel });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorLenguaje(req: Request, res: Response): Promise<void> {
        try {
            const id_lenguaje = Number(req.params.id_lenguaje);
            const niveles = await ServicioNivel.obtenerPorLenguaje(id_lenguaje);
            res.status(200).json({ status: 'success', data: niveles });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async crear(req: Request, res: Response): Promise<void> {
        try {
            const nuevoNivel = await ServicioNivel.crear(req.body);
            res.status(201).json({ status: 'success', message: 'Nivel creado correctamente', data: nuevoNivel });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id_nivel = Number(req.params.id);
            await ServicioNivel.actualizar(id_nivel, req.body);
            res.status(200).json({ status: 'success', message: 'Nivel actualizado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async desactivar(req: Request, res: Response): Promise<void> {
        try {
            const id_nivel = Number(req.params.id);
            await ServicioNivel.desactivar(id_nivel);
            res.status(200).json({ status: 'success', message: 'Nivel desactivado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
}