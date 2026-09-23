import { Request, Response } from 'express';
import { ServicioLenguaje } from '../services/lenguaje.service';

export class ControladorLenguaje {

    static async obtenerTodos(peticion: Request, respuesta: Response): Promise<Response> {
        try {
            const lenguajes = await ServicioLenguaje.obtenerTodos();
            return respuesta.status(200).json({
                exito: true,
                datos: lenguajes
            });
        } catch (error: any) {
            return respuesta.status(500).json({
                exito: false,
                mensaje: 'Error al obtener la lista de lenguajes.',
                error: error.message
            });
        }
    }

    static async obtenerPorId(peticion: Request, respuesta: Response): Promise<Response> {
        try {
            const id_lenguaje = Number(peticion.params.id);
            
            if (isNaN(id_lenguaje)) {
                return respuesta.status(400).json({
                    exito: false,
                    mensaje: 'El ID proporcionado debe ser un número válido.'
                });
            }

            const lenguaje = await ServicioLenguaje.obtenerPorId(id_lenguaje);
            return respuesta.status(200).json({
                exito: true,
                datos: lenguaje
            });
        } catch (error: any) {
            return respuesta.status(404).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    static async crear(peticion: Request, respuesta: Response): Promise<Response> {
        try {
            const nuevoLenguaje = await ServicioLenguaje.crear(peticion.body);
            return respuesta.status(201).json({
                exito: true,
                mensaje: 'Lenguaje creado exitosamente.',
                datos: nuevoLenguaje
            });
        } catch (error: any) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    static async actualizar(peticion: Request, respuesta: Response): Promise<Response> {
        try {
            const id_lenguaje = Number(peticion.params.id);

            if (isNaN(id_lenguaje)) {
                return respuesta.status(400).json({
                    exito: false,
                    mensaje: 'El ID proporcionado debe ser un número válido.'
                });
            }

            const actualizado = await ServicioLenguaje.actualizar(id_lenguaje, peticion.body);
            return respuesta.status(200).json({
                exito: true,
                mensaje: 'Lenguaje actualizado exitosamente.'
            });
        } catch (error: any) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }

    static async desactivar(peticion: Request, respuesta: Response): Promise<Response> {
        try {
            const id_lenguaje = Number(peticion.params.id);

            if (isNaN(id_lenguaje)) {
                return respuesta.status(400).json({
                    exito: false,
                    mensaje: 'El ID proporcionado debe ser un número válido.'
                });
            }

            await ServicioLenguaje.desactivar(id_lenguaje);
            return respuesta.status(200).json({
                exito: true,
                mensaje: 'Lenguaje desactivado exitosamente.'
            });
        } catch (error: any) {
            return respuesta.status(400).json({
                exito: false,
                mensaje: error.message
            });
        }
    }
}