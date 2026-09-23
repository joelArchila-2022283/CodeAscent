import { Router } from 'express';
import { pool } from '../config/conexion';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { LanguageService } from '../services/language.service';

const router = Router();
router.use(verificarAutenticacion);

router.get('/', async (_req, res) => {
    const resultado = await pool.query(
        `SELECT id_lenguaje, nombre, slug, descripcion
         FROM lenguaje WHERE estado = TRUE ORDER BY id_lenguaje`
    );
    res.json({ status: 'success', data: resultado.rows });
});

router.get('/:slug/missions', async (req, res) => {
    try {
        const lenguaje = await LanguageService.resolverPorSlug(req.params.slug);
        const resultado = await pool.query(
            `SELECT l.id_leccion, l.id_nivel, l.titulo, l.contenido, l.orden,
                    n.numero_nivel,
                    CASE WHEN mp.completed THEN 'completed'
                         WHEN n.numero_nivel = 1 OR EXISTS (
                           SELECT 1 FROM leccion anterior
                           JOIN nivel nivel_anterior ON nivel_anterior.id_nivel = anterior.id_nivel
                           JOIN mission_progress progreso_anterior
                             ON progreso_anterior.mission_id = anterior.id_leccion
                            AND progreso_anterior.user_id = $2
                            AND progreso_anterior.completed = TRUE
                           WHERE nivel_anterior.id_lenguaje = n.id_lenguaje
                             AND nivel_anterior.numero_nivel = n.numero_nivel - 1
                         ) THEN 'available'
                         ELSE 'locked' END AS estado
             FROM leccion l
             JOIN nivel n ON n.id_nivel = l.id_nivel
             LEFT JOIN mission_progress mp
               ON mp.mission_id = l.id_leccion AND mp.user_id = $2
             WHERE n.id_lenguaje = $1 AND l.estado = TRUE
             ORDER BY n.numero_nivel, l.orden`,
            [lenguaje.id_lenguaje, req.usuario!.id_usuario]
        );
        res.json({ status: 'success', data: resultado.rows });
    } catch (error) {
        const status = (error as Error & { statusCode?: number }).statusCode ?? 500;
        res.status(status).json({ status: 'error', message: (error as Error).message });
    }
});

export default router;
