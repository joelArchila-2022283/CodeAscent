import { Request, Response } from 'express';
import { pool } from '../config/conexion';

export const obtenerNivelesSql = async (_req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(`
      SELECT
        n.id_nivel,
        n.id_lenguaje,
        n.nombre,
        n.numero_nivel,
        n.descripcion,
        n.xp_requerida,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id_leccion', l.id_leccion,
            'titulo', l.titulo,
            'contenido', l.contenido,
            'orden', l.orden,
            'ejemplos', COALESCE((
              SELECT json_agg(json_build_object(
                'id_ejemplo', e.id_ejemplo,
                'titulo', e.titulo,
                'codigo', e.codigo,
                'explicacion', e.explicacion
              ) ORDER BY e.id_ejemplo)
              FROM ejemplo e
              WHERE e.id_leccion = l.id_leccion
            ), '[]'::json)
          ) ORDER BY l.orden)
          FROM leccion l
          WHERE l.id_nivel = n.id_nivel AND l.estado = TRUE
        ), '[]'::json) AS lecciones,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id_reto', r.id_reto,
            'id_leccion', r.id_leccion,
            'titulo', r.titulo,
            'descripcion', r.descripcion,
            'tipo_reto', r.tipo_reto,
            'xp_recompensa', r.xp_recompensa,
            'dificultad', r.dificultad,
            'respuestas', COALESCE((
              SELECT json_agg(json_build_object(
                'id_respuesta', rp.id_respuesta,
                'contenido', rp.contenido,
                'es_correcta', rp.es_correcta
              ) ORDER BY rp.id_respuesta)
              FROM respuesta rp
              WHERE rp.id_reto = r.id_reto
            ), '[]'::json)
          ) ORDER BY r.id_reto)
          FROM reto r
          INNER JOIN leccion lr ON lr.id_leccion = r.id_leccion AND lr.estado = TRUE
          WHERE lr.id_nivel = n.id_nivel AND r.estado = TRUE
        ), '[]'::json) AS retos
      FROM nivel n
      INNER JOIN lenguaje lenguaje_sql
        ON lenguaje_sql.id_lenguaje = n.id_lenguaje
       AND LOWER(lenguaje_sql.nombre) = 'sql'
       AND lenguaje_sql.estado = TRUE
      WHERE n.estado = TRUE
      ORDER BY n.numero_nivel ASC
    `);

    // Normaliza SQL a 100 XP por nivel (máximo 1000) aunque la BD aún tenga valores viejos 50..500
    const normalizados = resultado.rows.map((nivel: any) => ({
      ...nivel,
      xp_requerida: 100,
    }));
    res.status(200).json({ status: 'success', data: normalizados });
  } catch (error: any) {
    console.error('Error al obtener niveles SQL:', error?.message || error);
    res.status(500).json({ status: 'error', message: 'No se pudieron cargar los niveles SQL.' });
  }
};
