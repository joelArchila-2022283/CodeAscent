import { IIntento } from '../interfaces/intento.interface';
import { ModeloIntento } from '../models/intento.model';

export class IntentoService {

    static async obtenerTodos(): Promise<IIntento[]> {
        return await ModeloIntento.obtenerTodos();
    }

    static async obtenerPorId(id_intento: number): Promise<IIntento | null> {
        return await ModeloIntento.obtenerPorId(id_intento);
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IIntento[]> {
        return await ModeloIntento.obtenerPorUsuario(id_usuario);
    }

    static async obtenerPorReto(id_reto: number): Promise<IIntento[]> {
        return await ModeloIntento.obtenerPorReto(id_reto);
    }

    static async crear(datosIntento: IIntento): Promise<IIntento> {
        return await ModeloIntento.crear(datosIntento);
    }

    static async actualizar(
        id_intento: number,
        datosIntento: Partial<IIntento>
    ): Promise<boolean> {

        const intento = await ModeloIntento.obtenerPorId(id_intento);

        if (!intento) {
            throw new Error('Intento no encontrado');
        }

        return await ModeloIntento.actualizar(
            id_intento,
            datosIntento
        );
    }

    static async eliminar(id_intento: number): Promise<boolean> {

        const intento = await ModeloIntento.obtenerPorId(id_intento);

        if (!intento) {
            throw new Error('Intento no encontrado');
        }

        return await ModeloIntento.eliminar(id_intento);
    }
}