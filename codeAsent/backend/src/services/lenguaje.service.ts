import { ModeloLenguaje } from '../models/lenguaje.model';
import { ILenguaje } from '../interfaces/lenguaje.interface';

export class ServicioLenguaje {

    static async obtenerTodos(): Promise<ILenguaje[]> {
        return await ModeloLenguaje.obtenerTodos();
    }

    static async obtenerPorId(id_lenguaje: number): Promise<ILenguaje> {
        const lenguaje = await ModeloLenguaje.obtenerPorId(id_lenguaje);
        
        if (!lenguaje) {
            throw new Error(`El lenguaje con ID ${id_lenguaje} no existe o está inactivo.`);
        }

        return lenguaje;
    }

    static async crear(datos: ILenguaje): Promise<ILenguaje> {
      
        if (!datos.nombre || datos.nombre.trim() === '') {
            throw new Error('El nombre del lenguaje es obligatorio.');
        }

        const nombreLimpio = datos.nombre.trim();

        const lenguajeExistente = await ModeloLenguaje.obtenerPorNombre(nombreLimpio);
        if (lenguajeExistente) {
            throw new Error(`Ya existe un lenguaje registrado con el nombre '${nombreLimpio}'.`);
        }

        return await ModeloLenguaje.crear({
            nombre: nombreLimpio,
            descripcion: datos.descripcion ? datos.descripcion.trim() : undefined
        });
    }

    static async actualizar(id_lenguaje: number, datos: Partial<ILenguaje>): Promise<boolean> {
    
        await ServicioLenguaje.obtenerPorId(id_lenguaje);

        if (datos.nombre) {
            const nombreLimpio = datos.nombre.trim();
            const lenguajeExistente = await ModeloLenguaje.obtenerPorNombre(nombreLimpio);

            if (lenguajeExistente && lenguajeExistente.id_lenguaje !== id_lenguaje) {
                throw new Error(`Ya existe otro lenguaje registrado con el nombre '${nombreLimpio}'.`);
            }
            datos.nombre = nombreLimpio;
        }

        if (datos.descripcion) {
            datos.descripcion = datos.descripcion.trim();
        }

        return await ModeloLenguaje.actualizar(id_lenguaje, datos);
    }

    // Desactivar un lenguaje (Eliminación lógica)
    static async desactivar(id_lenguaje: number): Promise<boolean> {
        
        await ServicioLenguaje.obtenerPorId(id_lenguaje);
        return await ModeloLenguaje.desactivar(id_lenguaje);
    }
}