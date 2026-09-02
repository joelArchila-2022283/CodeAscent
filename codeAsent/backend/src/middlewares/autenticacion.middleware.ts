import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../utils/jwt.util';

export const verificarAutenticacion = (req: Request, res: Response, next: NextFunction): void => {
    const cabeceraAutorizacion = req.headers.authorization;

    if (!cabeceraAutorizacion || !cabeceraAutorizacion.startsWith('Bearer ')) {
        res.status(401).json({
            exito: false,
            mensaje: 'Acceso no autorizado. Se requiere un token de autenticación.'
        });
        return;
    }

    const token = cabeceraAutorizacion.split(' ')[1];
    const datosUsuario = verificarToken(token);

    if (!datosUsuario) {
        res.status(401).json({
            exito: false,
            mensaje: 'Token inválido o expirado. Por favor, inicia sesión nuevamente.'
        });
        return;
    }

    req.usuario = datosUsuario;
    next();
};