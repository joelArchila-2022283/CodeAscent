import { ModeloReto } from '../models/reto.model';
import { IReto, TipoReto, DificultadReto } from '../interfaces/reto.interface';

const TIPOS_VALIDOS: TipoReto[] = ['opcion_multiple', 'codigo', 'verdadero_falso', 'completar'];
const DIFICULTADES_VALIDAS: DificultadReto[] = ['facil', 'medio', 'dificil'];

export class ServicioReto {

    static async obtenerTodos(): Promise<IReto[]> {
        return await ModeloReto.obtenerTodos();
    }

    static async obtenerPorId(id_reto: number): Promise<IReto> {
        if (!id_reto || id_reto <= 0) {
            throw new Error('El ID del reto debe ser un número entero positivo válido.');
        }

        const reto = await ModeloReto.obtenerPorId(id_reto);
        if (!reto) {
            throw new Error(`El reto con ID ${id_reto} no existe o está inactivo.`);
        }
        return reto;
    }

    static async obtenerPorLeccion(id_leccion: number): Promise<IReto[]> {
        if (!id_leccion || id_leccion <= 0) {
            throw new Error('El ID de la lección debe ser un número entero positivo válido.');
        }
        return await ModeloReto.obtenerPorLeccion(id_leccion);
    }

    static async crear(reto: IReto): Promise<IReto> {
        if (!reto.id_leccion || reto.id_leccion <= 0) {
            throw new Error('El ID de la lección es obligatorio y debe ser un número positivo.');
        }

        if (!reto.titulo || reto.titulo.trim() === '') {
            throw new Error('El título del reto es obligatorio.');
        }

        if (!reto.descripcion || reto.descripcion.trim() === '') {
            throw new Error('La descripción del reto es obligatoria.');
        }

        if (!reto.tipo_reto || !TIPOS_VALIDOS.includes(reto.tipo_reto)) {
            throw new Error(`El tipo_reto no es válido. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}.`);
        }

        if (reto.dificultad && !DIFICULTADES_VALIDAS.includes(reto.dificultad)) {
            throw new Error(`La dificultad no es válida. Valores permitidos: ${DIFICULTADES_VALIDAS.join(', ')}.`);
        }

        if (reto.xp_recompensa !== undefined && reto.xp_recompensa < 0) {
            throw new Error('La recompensa en XP no puede ser un valor negativo.');
        }

        return await ModeloReto.crear(reto);
    }

    static async actualizar(id_reto: number, reto: Partial<IReto>): Promise<boolean> {
        await this.obtenerPorId(id_reto);

        if (reto.tipo_reto && !TIPOS_VALIDOS.includes(reto.tipo_reto)) {
            throw new Error(`El tipo_reto no es válido. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}.`);
        }

        if (reto.dificultad && !DIFICULTADES_VALIDAS.includes(reto.dificultad)) {
            throw new Error(`La dificultad no es válida. Valores permitidos: ${DIFICULTADES_VALIDAS.join(', ')}.`);
        }

        if (reto.xp_recompensa !== undefined && reto.xp_recompensa < 0) {
            throw new Error('La recompensa en XP no puede ser un valor negativo.');
        }

        return await ModeloReto.actualizar(id_reto, reto);
    }

    static async eliminarLogicamente(id_reto: number): Promise<boolean> {
        await this.obtenerPorId(id_reto);
        return await ModeloReto.eliminarLogicamente(id_reto);
    }
}