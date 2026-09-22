import { Router } from 'express';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { LanguageService } from '../services/language.service';
import { GamificationService } from '../services/gamification.service';

const router = Router();
router.use(verificarAutenticacion);

router.get('/me/gamification', async (req, res) => {
    try {
        const lenguaje = await LanguageService.resolverPorSlug(String(req.query.lang ?? ''));
        const data = await GamificationService.obtenerGamificacion(req.usuario!.id_usuario, lenguaje.id_lenguaje);
        res.json({ status: 'success', data: { ...data, lenguaje } });
    } catch (error) {
        const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
        res.status(status).json({ status: 'error', message: (error as Error).message });
    }
});

export default router;
