import { Router } from 'express';
import { pool } from '../config/conexion';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';
import { GamificationService } from '../services/gamification.service';

const router = Router();
router.use(verificarAutenticacion);

router.get('/:leccionId/quiz', async (req, res) => {
    const resultado = await pool.query(
        `SELECT r.id_reto, r.titulo AS enunciado, r.xp_recompensa,
                COALESCE(json_agg(json_build_object('id_respuesta', a.id_respuesta,
                    'texto_respuesta', a.contenido, 'es_correcta', a.es_correcta)
                    ORDER BY a.id_respuesta) FILTER (WHERE a.id_respuesta IS NOT NULL), '[]'::json) AS respuestas
         FROM reto r
         LEFT JOIN respuesta a ON a.id_reto = r.id_reto
         WHERE r.id_leccion = $1 AND r.estado = TRUE
         GROUP BY r.id_reto, r.titulo
         ORDER BY r.id_reto
          LIMIT 3`,
        [Number(req.params.leccionId)]
    );
    res.json({ status: 'success', data: resultado.rows });
});

router.post('/:missionId/complete', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.usuario!.id_usuario;
        const missionId = Number(req.params.missionId);
        const correct = Number(req.body.correct ?? 0);
        const total = Number(req.body.total ?? 0);
        const source = req.body.source === 'terminal' ? 'terminal' : 'quiz';
        const progress = await client.query(
            `SELECT mp.*, n.xp_requerida, n.id_lenguaje
             FROM mission_progress mp
             JOIN leccion le ON le.id_leccion = mp.mission_id
             JOIN nivel n ON n.id_nivel = le.id_nivel
             WHERE mp.user_id = $1 AND mp.mission_id = $2
             FOR UPDATE`,
            [userId, missionId]
        );
        const row = progress.rows[0];
        if (!row) return res.status(404).json({ status: 'error', message: 'Progreso no encontrado.' });
        if (source === 'terminal' && !row.terminal_code) {
            return res.status(409).json({ status: 'error', message: 'Realiza el ejercicio de la consola para obtener tu XP' });
        }
        if (source === 'terminal' && !['terminal', 'quiz'].includes(row.reached_step)) {
            return res.status(409).json({ status: 'error', message: 'La terminal aún no está completada.' });
        }
        if (source === 'quiz' && row.reached_step !== 'quiz') {
            return res.status(409).json({ status: 'error', message: 'El cuestionario aún no está desbloqueado.' });
        }

        const perfect = source === 'terminal' || (total > 0 && correct === total);
        if (!perfect) {
            await client.query('COMMIT');
            return res.json({ status: 'success', data: { completed: false, xp_awarded: 0, correct, total, perfect: false, newAchievements: [] } });
        }

        if (row.completed) {
            await client.query('COMMIT');
            return res.json({ status: 'success', data: { completed: true, xp_awarded: 0, correct, total, perfect: true, newAchievements: [] } });
        }

        await client.query(
            `UPDATE mission_progress SET completed = TRUE, first_try_perfect = (pistas_usadas = 0), updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND mission_id = $2`,
            [userId, missionId]
        );
        await client.query(
            `INSERT INTO usuario_xp (user_id, id_lenguaje, xp) VALUES ($1, $2, $3)
             ON CONFLICT (user_id, id_lenguaje) DO UPDATE SET xp = usuario_xp.xp + EXCLUDED.xp`,
            [userId, row.id_lenguaje, row.xp_requerida]
        );
        const logros = await GamificationService.evaluateAchievements(client, userId, row.id_lenguaje);
        await client.query('COMMIT');
        res.json({ status: 'success', data: { completed: true, xp_awarded: row.xp_requerida, correct, total, perfect: true, newAchievements: logros.filter((logro: { obtenido: boolean }) => logro.obtenido) } });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: (error as Error).message });
    } finally {
        client.release();
    }
});

export default router;
