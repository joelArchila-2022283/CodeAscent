import { ModeloLenguaje } from '../models/lenguaje.model';
import { ILenguaje } from '../models/lenguaje.interface';

export class ServicioLenguaje {

    static async obtenerTodos(): Promise<ILenguaje[]> {
        return await ModeloLenguaje.obtenerTodos();
    }

    static async obtenerPorId(id_lenguaje: number): Promise<ILenguaje> {
        const lenguaje = await ModeloLenguaje.obtenerPorId(id_lenguaje);
        if (!lenguaje) {
            throw new Error(`El lenguaje con id ${id_lenguaje} no existe o está inactivo.`);
        }
        return lenguaje;
    }

    static async crear(datosLenguaje: ILenguaje): Promise<ILenguaje> {
        if (!datosLenguaje.nombre || datosLenguaje.nombre.trim() === '') {
            throw new Error('El nombre del lenguaje es obligatorio.');
        }

        const lenguajeExistente = await ModeloLenguaje.obtenerPorNombre(datosLenguaje.nombre);
        if (lenguajeExistente) {
            throw new Error(`Ya existe un lenguaje registrado con el nombre "${datosLenguaje.nombre}".`);
        }

        return await ModeloLenguaje.crear(datosLenguaje);
    }

    static async actualizar(id_lenguaje: number, datosLenguaje: Partial<ILenguaje>): Promise<boolean> {
        await this.obtenerPorId(id_lenguaje);

        if (datosLenguaje.nombre !== undefined && datosLenguaje.nombre.trim() === '') {
            throw new Error('El nombre del lenguaje no puede estar vacío.');
        }

        return await ModeloLenguaje.actualizar(id_lenguaje, datosLenguaje);
    }

    static async desactivar(id_lenguaje: number): Promise<boolean> {
        await this.obtenerPorId(id_lenguaje);
        return await ModeloLenguaje.desactivar(id_lenguaje);
    }
}