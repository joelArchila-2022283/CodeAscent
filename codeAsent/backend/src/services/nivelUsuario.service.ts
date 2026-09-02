import { ModeloNivelUsuario } from '../models/nivelUsuario.model';
import { INivelUsuario } from '../interfaces/nivelUsuario.interface';

export class NivelUsuarioService {

    async obtenerTodos(): Promise<INivelUsuario[]> {
        return await ModeloNivelUsuario.obtenerTodos();
    }

    async obtenerPorId(id: number): Promise<INivelUsuario | null> {
        return await ModeloNivelUsuario.obtenerPorId(id);
    }

    async obtenerPorUsuarioYNivel(idUsuario: number, idNivel: number): Promise<INivelUsuario | null> {
        return await ModeloNivelUsuario.obtenerPorUsuarioYNivel(idUsuario, idNivel);
    }

    async crear(datos: INivelUsuario): Promise<INivelUsuario> {
        return await ModeloNivelUsuario.crear(datos);
    }

    async actualizar(id: number, datos: Partial<INivelUsuario>): Promise<boolean> {
        return await ModeloNivelUsuario.actualizar(id, datos);
    }

    async eliminar(id: number): Promise<boolean> {
        return await ModeloNivelUsuario.eliminar(id);
    }

}