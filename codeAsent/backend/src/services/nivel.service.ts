import { ModeloNivel } from '../models/nivel.model';
import { INivel } from '../interfaces/nivel.interface';

export class ServicioNivel {
    static async obtenerTodos(): Promise<INivel[]> {
        return await ModeloNivel.obtenerTodos();
    }

    static async obtenerPorId(id_nivel: number): Promise<INivel> {
        const nivel = await ModeloNivel.obtenerPorId(id_nivel);
        if (!nivel) {
            throw new Error(`El nivel con id ${id_nivel} no existe o está inactivo.`);
        }
        return nivel;
    }

    static async obtenerPorLenguaje(id_lenguaje: number): Promise<INivel[]> {
        return await ModeloNivel.obtenerPorLenguaje(id_lenguaje);
    }

    static async crear(datosNivel: INivel): Promise<INivel> {
        if (!datosNivel.id_lenguaje || !datosNivel.nombre || datosNivel.numero_nivel === undefined) {
            throw new Error('Los campos id_lenguaje, nombre y numero_nivel son obligatorios.');
        }

        if (datosNivel.numero_nivel <= 0) {
            throw new Error('El número de nivel debe ser mayor a 0.');
        }

        if (datosNivel.xp_requerida !== undefined && datosNivel.xp_requerida < 0) {
            throw new Error('La XP requerida no puede ser negativa.');
        }

        return await ModeloNivel.crear(datosNivel);
    }

    static async actualizar(id_nivel: number, datosNivel: Partial<INivel>): Promise<boolean> {
        await this.obtenerPorId(id_nivel);

        if (datosNivel.numero_nivel !== undefined && datosNivel.numero_nivel <= 0) {
            throw new Error('El número de nivel debe ser mayor a 0.');
        }

        return await ModeloNivel.actualizar(id_nivel, datosNivel);
    }

    static async desactivar(id_nivel: number): Promise<boolean> {
        await this.obtenerPorId(id_nivel);
        return await ModeloNivel.desactivar(id_nivel);
    }
}