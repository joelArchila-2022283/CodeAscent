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
        const progress = await client.query(
            `SELECT mp.*, n.xp_requerida, n.id_lenguaje
             FROM mission_progress mp
             JOIN leccion le ON le.id_leccion = mp.mission_id
             JOIN nivel n ON n.id_nivel = le.id_nivel
             WHERE mp.user_id = $1 AND mp.mission_id = $2
             FOR UPDATE`,
            [userId, missionId]
        );
        let row = progress.rows[0];

        if (!row) {
            const info = await client.query(
                `SELECT n.id_lenguaje, n.id_nivel, n.xp_requerida
                 FROM leccion le
                 JOIN nivel n ON n.id_nivel = le.id_nivel
                 WHERE le.id_leccion = $1 AND le.estado = TRUE`,
                [missionId]
            );
            if (!info.rows[0]) return res.status(404).json({ status: 'error', message: 'Misión no encontrada.' });
            await client.query(
                `INSERT INTO mission_progress (user_id, mission_id, reached_step)
                 VALUES ($1, $2, 'quiz')
                 ON CONFLICT (user_id, mission_id) DO NOTHING`,
                [userId, missionId]
            );
            row = {
                mission_id: missionId,
                reached_step: 'quiz',
                completed: false,
                first_try_perfect: true,
                pistas_usadas: 0,
                id_lenguaje: info.rows[0].id_lenguaje,
                xp_requerida: info.rows[0].xp_requerida
            };
        }

        const perfect = total > 0 && correct === total;
        if (!perfect) {
            await client.query('COMMIT');
            return res.json({ status: 'success', data: { completed: false, xp_awarded: 0, correct, total, perfect: false, newAchievements: [] } });
        }

        if (row.completed) {
            await client.query('COMMIT');
            return res.json({ status: 'success', data: { completed: true, xp_awarded: 0, correct, total, perfect: true, newAchievements: [] } });
        }

        await client.query(
            `UPDATE mission_progress
                SET reached_step = 'quiz', completed = TRUE,
                    first_try_perfect = (pistas_usadas = 0),
                    updated_at = CURRENT_TIMESTAMP
              WHERE user_id = $1 AND mission_id = $2`,
            [userId, missionId]
        );
        const logros = await GamificationService.evaluateAchievements(client, userId, row.id_lenguaje);
        await client.query('COMMIT');
        res.json({ status: 'success', data: { completed: true, xp_awarded: 0, correct, total, perfect: true, newAchievements: logros.filter((logro: { obtenido: boolean }) => logro.obtenido) } });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: (error as Error).message });
    } finally {
        client.release();
    }
});

export default router;
