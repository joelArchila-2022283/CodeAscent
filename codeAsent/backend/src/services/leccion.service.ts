import { ModeloLeccion } from '../models/leccion.model';
import { ILeccion } from '../models/leccion.interface';

export class ServicioLeccion {

    static async obtenerTodas(): Promise<ILeccion[]> {
        return await ModeloLeccion.obtenerTodas();
    }

    static async obtenerPorId(id_leccion: number): Promise<ILeccion> {
        const leccion = await ModeloLeccion.obtenerPorId(id_leccion);
        if (!leccion) {
            throw new Error(`La lección con id ${id_leccion} no existe o está inactiva.`);
        }
        return leccion;
    }

    static async obtenerPorNivel(id_nivel: number): Promise<ILeccion[]> {
        return await ModeloLeccion.obtenerPorNivel(id_nivel);
    }

    static async crear(datosLeccion: ILeccion): Promise<ILeccion> {
        const { id_nivel, titulo, contenido, orden } = datosLeccion;

        if (!id_nivel || !titulo || !contenido || orden === undefined) {
            throw new Error('Los campos id_nivel, titulo, contenido y orden son obligatorios.');
        }

        if (titulo.trim() === '' || contenido.trim() === '') {
            throw new Error('El título y el contenido no pueden estar vacíos.');
        }

        if (orden <= 0) {
            throw new Error('El orden de la lección debe ser un número mayor a 0.');
        }

        return await ModeloLeccion.crear(datosLeccion);
    }

    static async actualizar(id_leccion: number, datosLeccion: Partial<ILeccion>): Promise<boolean> {
        await this.obtenerPorId(id_leccion);

        if (datosLeccion.orden !== undefined && datosLeccion.orden <= 0) {
            throw new Error('El orden de la lección debe ser mayor a 0.');
        }

        return await ModeloLeccion.actualizar(id_leccion, datosLeccion);
    }

    static async desactivar(id_leccion: number): Promise<boolean> {
        await this.obtenerPorId(id_leccion);
        return await ModeloLeccion.desactivar(id_leccion);
    }
}