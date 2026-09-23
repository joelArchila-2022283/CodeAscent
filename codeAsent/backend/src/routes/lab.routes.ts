import { Router } from 'express';
import { pool } from '../config/conexion';
import { verificarAutenticacion } from '../middlewares/autenticacion.middleware';

const router = Router();
router.use(verificarAutenticacion);

router.get('/:leccionId/lab', async (req, res) => {
    const resultado = await pool.query(
        `SELECT l.id_leccion, l.titulo AS titulo_leccion, l.contenido AS contenido_leccion,
                lang.slug AS slug_lenguaje,
                COALESCE((SELECT json_agg(json_build_object('id_pista', p.id_pista, 'orden', p.orden, 'texto', p.texto)
                          ORDER BY p.orden) FROM (SELECT * FROM pista WHERE id_leccion = l.id_leccion ORDER BY orden LIMIT 5) p), '[]'::json) AS pistas,
                (SELECT json_build_object(
                    'id_prediccion', pr.id_prediccion,
                    'pregunta', pr.pregunta,
                    'opciones', COALESCE((SELECT json_agg(json_build_object('id_opcion', po.id_opcion, 'texto', po.texto, 'es_correcta', po.es_correcta)
                                           ORDER BY po.id_opcion)
                                          FROM prediccion_opcion po WHERE po.id_prediccion = pr.id_prediccion), '[]'::json)
                 ) FROM prediccion pr WHERE pr.id_leccion = l.id_leccion) AS prediccion
         FROM leccion l
         JOIN nivel n ON n.id_nivel = l.id_nivel
         JOIN lenguaje lang ON lang.id_lenguaje = n.id_lenguaje
         WHERE l.id_leccion = $1 AND l.estado = TRUE`,
        [Number(req.params.leccionId)]
    );
    if (!resultado.rows[0]) return res.status(404).json({ status: 'error', message: 'Lección no encontrada.' });
    res.json({ status: 'success', data: resultado.rows[0] });
});

export default router;
