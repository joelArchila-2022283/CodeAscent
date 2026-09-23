import jwt from 'jsonwebtoken';
import { IPayloadToken } from '../interfaces/jwt.interface';

const CLAVE_SECRETA = process.env.JWT_SECRET || 'clave_secreta_codeasent';
const TIEMPO_EXPIRACION = '24h';

export const generarToken = (payload: IPayloadToken): string => {
    return jwt.sign(payload, CLAVE_SECRETA, { expiresIn: TIEMPO_EXPIRACION });
};

export const verificarToken = (token: string): IPayloadToken | null => {
    try {
        return jwt.verify(token, CLAVE_SECRETA) as IPayloadToken;
    } catch (error) {
        return null;
    }
};