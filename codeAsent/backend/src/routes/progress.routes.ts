import { Router } from 'express';
import { pool } from '../config/conexion';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const ordenPasos = ['manual', 'lesson', 'terminal', 'quiz'];
const router = Router();
router.use(verificarAutenticacion);

router.get('/:missionId/progress', async (req, res) => {
    const missionId = Number(req.params.missionId);
    const resultado = await pool.query(
        `SELECT user_id, mission_id, reached_step, completed, prediccion_correcta,
                pistas_usadas, first_try_perfect, updated_at
         FROM mission_progress WHERE user_id = $1 AND mission_id = $2`,
        [req.usuario!.id_usuario, missionId]
    );
    res.json({ status: 'success', data: resultado.rows[0] ?? {
        user_id: req.usuario!.id_usuario,
        mission_id: missionId,
        reached_step: 'manual',
        completed: false,
        prediccion_correcta: false,
        pistas_usadas: 0,
        first_try_perfect: false
    } });
});

router.post('/:missionId/progress', async (req, res) => {
    const missionId = Number(req.params.missionId);
    const step = String(req.body.reached_step ?? 'manual');
    const index = ordenPasos.indexOf(step);
    if (index < 0) return res.status(400).json({ status: 'error', message: 'Paso inválido.' });

    const actual = await pool.query<{ reached_step: string }>(
        `SELECT reached_step FROM mission_progress WHERE user_id = $1 AND mission_id = $2`,
        [req.usuario!.id_usuario, missionId]
    );
    const actualIndex = ordenPasos.indexOf(actual.rows[0]?.reached_step ?? 'manual');
    if (index > actualIndex + 1) return res.status(409).json({ status: 'error', message: 'Debes seguir el flujo de la misión.' });

    const resultado = await pool.query(
        `INSERT INTO mission_progress (user_id, mission_id, reached_step)
         SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM leccion WHERE id_leccion = $2)
         ON CONFLICT (user_id, mission_id) DO UPDATE
           SET reached_step = CASE
             WHEN array_position(ARRAY['manual','lesson','terminal','quiz'], mission_progress.reached_step)
                  < array_position(ARRAY['manual','lesson','terminal','quiz'], EXCLUDED.reached_step)
             THEN EXCLUDED.reached_step ELSE mission_progress.reached_step END,
               updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [req.usuario!.id_usuario, missionId, step]
    );
    if (!resultado.rows[0]) return res.status(404).json({ status: 'error', message: 'Misión no encontrada.' });
    res.json({ status: 'success', data: resultado.rows[0] });
});

router.post('/:missionId/terminal-stats', async (req, res) => {
    const resultado = await pool.query(
        `UPDATE mission_progress
            SET prediccion_correcta = prediccion_correcta OR $3::boolean,
                pistas_usadas = LEAST(5, GREATEST(pistas_usadas, $4::integer)),
                updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND mission_id = $2 AND completed = FALSE
          RETURNING *`,
        [req.usuario!.id_usuario, Number(req.params.missionId), Boolean(req.body.prediccion_correcta), Number(req.body.pistas_usadas ?? 0)]
    );
    if (!resultado.rows[0]) return res.status(404).json({ status: 'error', message: 'Progreso no encontrado o misión completada.' });
    res.json({ status: 'success', data: resultado.rows[0] });
});

export default router;
