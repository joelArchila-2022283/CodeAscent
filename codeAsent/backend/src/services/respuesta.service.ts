import { ModeloRespuesta } from '../models/respuesta.model';
import { IRespuesta } from '../interfaces/respuesta.interface';

export class RespuestaService {

    async obtenerTodas(): Promise<IRespuesta[]> {
        return await ModeloRespuesta.obtenerTodas();
    }

    async obtenerPorId(id: number): Promise<IRespuesta | null> {
        return await ModeloRespuesta.obtenerPorId(id);
    }

    async obtenerPorReto(idReto: number): Promise<IRespuesta[]> {
        return await ModeloRespuesta.obtenerPorReto(idReto);
    }

    async crear(datos: IRespuesta): Promise<IRespuesta> {
        return await ModeloRespuesta.crear(datos);
    }

    async actualizar(id: number, datos: Partial<IRespuesta>): Promise<boolean> {
        return await ModeloRespuesta.actualizar(id, datos);
    }

    async eliminar(id: number): Promise<boolean> {
        return await ModeloRespuesta.eliminar(id);
    }

}