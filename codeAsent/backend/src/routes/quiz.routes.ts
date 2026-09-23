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
         WHERE r.id_leccion = $1
           AND r.estado = TRUE
           AND r.tipo_reto = 'opcion_multiple'
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
            `SELECT mp.*, n.xp_requerida, n.numero_nivel, n.id_lenguaje, l.slug
             FROM mission_progress mp
             JOIN leccion le ON le.id_leccion = mp.mission_id
             JOIN nivel n ON n.id_nivel = le.id_nivel
             JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje
             WHERE mp.user_id = $1 AND mp.mission_id = $2
             FOR UPDATE`,
            [userId, missionId]
        );
        const row = progress.rows[0];
        if (!row) return res.status(404).json({ status: 'error', message: 'Progreso no encontrado.' });
        if (source === 'terminal') {
            await client.query('COMMIT');
            return res.json({ status: 'success', data: { completed: false, xp_awarded: 0, message: 'La consola quedó registrada. Completa el cuestionario para obtener tus puntos.' } });
        }
        if (!row.terminal_code || !row.prediccion_correcta) {
            return res.status(409).json({ status: 'error', message: 'Recuerda realizar el ejercicio de la consola para obtener tus puntos' });
        }
        if (source === 'quiz' && row.reached_step !== 'quiz') {
            return res.status(409).json({ status: 'error', message: 'El cuestionario aún no está desbloqueado.' });
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
            `UPDATE mission_progress SET completed = TRUE, first_try_perfect = (pistas_usadas = 0), updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND mission_id = $2`,
            [userId, missionId]
        );
        const xpAward = row.slug === 'sql' ? 100 : Number(row.numero_nivel) * 100;
        const progresoLenguaje = await client.query(
            `SELECT
                n.id_lenguaje,
                COALESCE(SUM(CASE WHEN mp.completed THEN CASE WHEN l.slug = 'sql' THEN 100 ELSE n.numero_nivel * 100 END ELSE 0 END), 0)::int AS xp,
                COUNT(DISTINCT n.id_nivel)::int AS total_niveles,
                COUNT(DISTINCT n.id_nivel) FILTER (WHERE mp.completed = TRUE)::int AS niveles_completados,
                COALESCE(
                    MIN(n.id_nivel) FILTER (WHERE COALESCE(mp.completed, FALSE) = FALSE),
                    MAX(n.id_nivel)
                ) AS id_nivel_actual
             FROM nivel n
             JOIN leccion le ON le.id_nivel = n.id_nivel AND le.estado = TRUE
             LEFT JOIN mission_progress mp
               ON mp.mission_id = le.id_leccion AND mp.user_id = $1
             WHERE n.id_lenguaje = $2 AND n.estado = TRUE
             GROUP BY n.id_lenguaje`,
            [userId, row.id_lenguaje]
        );
        const progresoActual = progresoLenguaje.rows[0];
        const xpTotal = Number(progresoActual?.xp ?? xpAward);
        const porcentaje = progresoActual?.total_niveles
            ? (Number(progresoActual.niveles_completados) / Number(progresoActual.total_niveles)) * 100
            : 0;

        await client.query(
            `INSERT INTO usuario_xp (user_id, id_lenguaje, xp) VALUES ($1, $2, $3)
             ON CONFLICT (user_id, id_lenguaje) DO UPDATE SET xp = EXCLUDED.xp`,
            [userId, row.id_lenguaje, xpTotal]
        );
        await client.query(
            `INSERT INTO progreso
                (id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
             ON CONFLICT (id_usuario, id_lenguaje) DO UPDATE SET
                id_nivel_actual = EXCLUDED.id_nivel_actual,
                xp_actual = EXCLUDED.xp_actual,
                porcentaje = EXCLUDED.porcentaje,
                fecha_actualizacion = CURRENT_TIMESTAMP`,
            [userId, row.id_lenguaje, progresoActual?.id_nivel_actual ?? row.id_nivel, xpTotal, porcentaje]
        );
        const logros = await GamificationService.evaluateAchievements(client, userId, row.id_lenguaje);
        await client.query('COMMIT');
        res.json({ status: 'success', data: { completed: true, xp_awarded: xpAward, xp_total: xpTotal, correct, total, perfect: true, newAchievements: logros.filter((logro: { obtenido: boolean }) => logro.obtenido) } });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ status: 'error', message: (error as Error).message });
    } finally {
        client.release();
    }
});

export default router;
