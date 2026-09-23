import { Request, Response, NextFunction } from 'express';

/**
 * Creador de middlewares para validar permisos por roles
 */
export const verificarRol = (...rolesPermitidos: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // 1. Verificar si req.usuario existe (debe pasar primero por verificarAutenticacion)
        if (!req.usuario) {
            res.status(401).json({
                exito: false,
                mensaje: 'Acceso no autorizado. Debe autenticarse primero.'
            });
            return;
        }

        // 2. Extraer el rol del token
        const rolUsuario = req.usuario.rol;

        // 3. Validar si el rol tiene permiso
        if (!rolesPermitidos.includes(rolUsuario)) {
            res.status(403).json({
                exito: false,
                mensaje: `Acceso prohibido. El rol '${rolUsuario}' no tiene permisos para esta acción.`
            });
            return;
        }

        next();
    };
};

/**
 * Middleware directo exclusivo para Administradores.
 */
export const esAdmin = verificarRol('admin');