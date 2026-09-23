import { Request, Response } from 'express';
import { ServicioLeccion } from '../services/leccion.service';

export class ControladorLeccion {

    static async obtenerTodas(_req: Request, res: Response): Promise<void> {
        try {
            const lecciones = await ServicioLeccion.obtenerTodas();
            res.status(200).json({ status: 'success', data: lecciones });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id_leccion = Number(req.params.id);
            const leccion = await ServicioLeccion.obtenerPorId(id_leccion);
            res.status(200).json({ status: 'success', data: leccion });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorNivel(req: Request, res: Response): Promise<void> {
        try {
            const id_nivel = Number(req.params.id_nivel);
            const lecciones = await ServicioLeccion.obtenerPorNivel(id_nivel);
            res.status(200).json({ status: 'success', data: lecciones });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async crear(req: Request, res: Response): Promise<void> {
        try {
            const nuevaLeccion = await ServicioLeccion.crear(req.body);
            res.status(201).json({ 
                status: 'success', 
                message: 'Lección creada correctamente', 
                data: nuevaLeccion 
            });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async actualizar(req: Request, res: Response): Promise<void> {
        try {
            const id_leccion = Number(req.params.id);
            await ServicioLeccion.actualizar(id_leccion, req.body);
            res.status(200).json({ status: 'success', message: 'Lección actualizada correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async desactivar(req: Request, res: Response): Promise<void> {
        try {
            const id_leccion = Number(req.params.id);
            await ServicioLeccion.desactivar(id_leccion);
            res.status(200).json({ status: 'success', message: 'Lección desactivada correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
}