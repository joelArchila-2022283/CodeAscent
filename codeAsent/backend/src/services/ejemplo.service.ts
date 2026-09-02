import { IEjemplo } from '../interfaces/ejemplo.interface';
import { ModeloEjemplo } from '../models/ejemplo.model';

export class EjemploService {

    static async obtenerTodos(): Promise<IEjemplo[]> {
        return await ModeloEjemplo.obtenerTodos();
    }

    static async obtenerPorId(id_ejemplo: number): Promise<IEjemplo | null> {
        return await ModeloEjemplo.obtenerPorId(id_ejemplo);
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IEjemplo[]> {
        return await ModeloEjemplo.obtenerPorLeccion(id_leccion);
    }

    static async crear(datosEjemplo: IEjemplo): Promise<IEjemplo> {
        return await ModeloEjemplo.crear(datosEjemplo);
    }

    static async actualizar(
        id_ejemplo: number,
        datosEjemplo: Partial<IEjemplo>
    ): Promise<boolean> {

        const ejemplo = await ModeloEjemplo.obtenerPorId(id_ejemplo);

        if (!ejemplo) {
            throw new Error('Ejemplo no encontrado');
        }

        return await ModeloEjemplo.actualizar(
            id_ejemplo,
            datosEjemplo
        );
    }

    static async eliminar(id_ejemplo: number): Promise<boolean> {

        const ejemplo = await ModeloEjemplo.obtenerPorId(id_ejemplo);

        if (!ejemplo) {
            throw new Error('Ejemplo no encontrado');
        }

        return await ModeloEjemplo.eliminar(id_ejemplo);
    }
}