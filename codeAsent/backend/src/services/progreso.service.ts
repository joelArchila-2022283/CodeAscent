import { ModeloProgreso } from '../models/progreso.model';
import { IProgreso } from '../interfaces/progreso.interface';

export class ServicioProgreso {

    static async obtenerTodos(): Promise<IProgreso[]> {
        return await ModeloProgreso.obtenerTodos();
    }

    static async obtenerPorId(id_progreso: number): Promise<IProgreso> {
        const progreso = await ModeloProgreso.obtenerPorId(id_progreso);
        if (!progreso) {
            throw new Error(`El registro de progreso con ID ${id_progreso} no existe.`);
        }
        return progreso;
    }

    static async obtenerPorUsuario(id_usuario: number): Promise<IProgreso[]> {
        return await ModeloProgreso.obtenerPorUsuario(id_usuario);
    }

    static async obtenerPorUsuarioYLenguaje(id_usuario: number, id_lenguaje: number): Promise<IProgreso> {
        const progreso = await ModeloProgreso.obtenerPorUsuarioYLenguaje(id_usuario, id_lenguaje);
        if (!progreso) {
            throw new Error(`No existe un registro de progreso para el usuario ${id_usuario} en el lenguaje ${id_lenguaje}.`);
        }
        return progreso;
    }

    static async crear(datosProgreso: IProgreso): Promise<IProgreso> {
        const { id_usuario, id_lenguaje, xp_actual, porcentaje } = datosProgreso;

        if (!id_usuario || !id_lenguaje) {
            throw new Error('Los campos id_usuario e id_lenguaje son obligatorios.');
        }

        const existe = await ModeloProgreso.obtenerPorUsuarioYLenguaje(id_usuario, id_lenguaje);
        if (existe) {
            throw new Error(`El usuario ${id_usuario} ya tiene un progreso registrado para el lenguaje ${id_lenguaje}.`);
        }

        if (xp_actual !== undefined && xp_actual < 0) {
            throw new Error('La XP actual no puede ser un valor negativo.');
        }

        if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
            throw new Error('El porcentaje debe ser un número entre 0.00 y 100.00.');
        }

        return await ModeloProgreso.crear(datosProgreso);
    }

    static async actualizar(id_progreso: number, datosProgreso: Partial<IProgreso>): Promise<boolean> {
        await this.obtenerPorId(id_progreso);

        if (datosProgreso.xp_actual !== undefined && datosProgreso.xp_actual < 0) {
            throw new Error('La XP actual no puede ser un valor negativo.');
        }

        if (datosProgreso.porcentaje !== undefined && (datosProgreso.porcentaje < 0 || datosProgreso.porcentaje > 100)) {
            throw new Error('El porcentaje debe estar dentro del rango de 0 a 100.');
        }

        return await ModeloProgreso.actualizar(id_progreso, datosProgreso);
    }

    static async eliminar(id_progreso: number): Promise<boolean> {
        await this.obtenerPorId(id_progreso);
        return await ModeloProgreso.eliminar(id_progreso);
    }
}