import { IPayloadToken } from '../interfaces/jwt.interface';

declare global {
    namespace Express {
        interface Request {
            usuario?: IPayloadToken;
        }
    }
}