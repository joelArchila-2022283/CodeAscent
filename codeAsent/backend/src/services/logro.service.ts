import { ModeloLogro } from '../models/logro.model';
import { Logro } from '../interfaces/logro.interface';

export class LogroService {
    static async obtenerTodos(): Promise<Logro[]> {
        return await ModeloLogro.obtenerTodos();
    }

    static async obtenerPorId(id_logro: number): Promise<Logro> {
        const logro = await ModeloLogro.obtenerPorId(id_logro);
        
        if (!logro) {
            throw new Error(`El logro con ID ${id_logro} no existe o está inactivo.`);
        }

        return logro;
    }

    static async crear(datos: Logro): Promise<Logro> {
        if (!datos.nombre || datos.nombre.trim() === '') {
            throw new Error('El nombre del logro es obligatorio.');
        }

        const nombreLimpio = datos.nombre.trim();

        const logroExistente = await ModeloLogro.obtenerPorNombre(nombreLimpio);
        if (logroExistente) {
            throw new Error(`Ya existe un logro registrado con el nombre '${nombreLimpio}'.`);
        }

        return await ModeloLogro.crear({
            ...datos,
            nombre: nombreLimpio,
            descripcion: datos.descripcion ? datos.descripcion.trim() : null,
            requisito: datos.requisito ? datos.requisito.trim() : null
        });
    }

    static async actualizar(id_logro: number, datos: Partial<Logro>): Promise<boolean> {
        await LogroService.obtenerPorId(id_logro);

        if (datos.nombre) {
            const nombreLimpio = datos.nombre.trim();
            const logroExistente = await ModeloLogro.obtenerPorNombre(nombreLimpio);

            if (logroExistente && logroExistente.id_logro !== id_logro) {
                throw new Error(`Ya existe otro logro registrado con el nombre '${nombreLimpio}'.`);
            }
            datos.nombre = nombreLimpio;
        }

        if (datos.descripcion) {
            datos.descripcion = datos.descripcion.trim();
        }

        if (datos.requisito) {
            datos.requisito = datos.requisito.trim();
        }

        return await ModeloLogro.actualizar(id_logro, datos);
    }

    static async desactivar(id_logro: number): Promise<boolean> {
        await LogroService.obtenerPorId(id_logro);
        return await ModeloLogro.desactivar(id_logro);
    }
}