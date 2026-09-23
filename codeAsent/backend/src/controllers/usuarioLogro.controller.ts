import { Request, Response } from 'express';
import { ServicioUsuarioLogro } from '../services/usuarioLogro.service';

export class ControladorUsuarioLogro {

    static async obtenerTodos(_req: Request, res: Response): Promise<void> {
        try {
            const registros = await ServicioUsuarioLogro.obtenerTodos();
            res.status(200).json({ status: 'success', data: registros });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorId(req: Request, res: Response): Promise<void> {
        try {
            const id_usuario_logro = Number(req.params.id);
            const registro = await ServicioUsuarioLogro.obtenerPorId(id_usuario_logro);
            res.status(200).json({ status: 'success', data: registro });
        } catch (error: any) {
            res.status(404).json({ status: 'error', message: error.message });
        }
    }

    static async obtenerPorUsuario(req: Request, res: Response): Promise<void> {
        try {
            const id_usuario = Number(req.params.id_usuario);
            const logrosUsuario = await ServicioUsuarioLogro.obtenerPorUsuario(id_usuario);
            res.status(200).json({ status: 'success', data: logrosUsuario });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async asignarLogro(req: Request, res: Response): Promise<void> {
        try {
            const { id_usuario, id_logro } = req.body;
            const nuevoRegistro = await ServicioUsuarioLogro.asignarLogro(Number(id_usuario), Number(id_logro));
            res.status(201).json({ 
                status: 'success', 
                message: 'Logro asignado correctamente al usuario', 
                data: nuevoRegistro 
            });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }

    static async eliminar(req: Request, res: Response): Promise<void> {
        try {
            const id_usuario_logro = Number(req.params.id);
            await ServicioUsuarioLogro.eliminar(id_usuario_logro);
            res.status(200).json({ status: 'success', message: 'Registro de logro eliminado correctamente' });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
}