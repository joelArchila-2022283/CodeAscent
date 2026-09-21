import { Request, Response } from 'express';
import { pool } from '../config/conexion';

const normalizarCss = (valor: string): string =>
  valor.toLowerCase().replace(/\s+/g, '').replace(/;}/g, '}').trim();

export const obtenerNivelesCss = async (_req: Request, res: Response): Promise<void> => {
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
      INNER JOIN lenguaje lenguaje_css
        ON lenguaje_css.id_lenguaje = n.id_lenguaje
       AND LOWER(lenguaje_css.nombre) = 'css'
       AND lenguaje_css.estado = TRUE
      WHERE n.estado = TRUE
      ORDER BY n.numero_nivel ASC
    `);

    res.status(200).json({ status: 'success', data: resultado.rows });
  } catch (error: any) {
    console.error('Error al obtener niveles CSS:', error?.message || error);
    res.status(500).json({ status: 'error', message: 'No se pudieron cargar los niveles CSS.' });
  }
};

/**
 * Valida una misión CSS en el servidor y registra el intento.
 * El id_usuario se toma del JWT, no del body.
 * PostgreSQL (sp_crear_intento) decide si el XP se entrega por primera vez.
 */
export const registrarIntentoCss = async (req: Request, res: Response): Promise<void> => {
  const idUsuario = req.usuario?.id_usuario;
  const idReto = Number(req.params.id_reto);
  const codigo = typeof req.body?.codigo === 'string' ? req.body.codigo : '';

  if (!idUsuario) {
    res.status(401).json({ status: 'error', message: 'Usuario no autenticado.' });
    return;
  }

  if (!Number.isInteger(idReto) || idReto <= 0 || !codigo.trim()) {
    res.status(400).json({ status: 'error', message: 'Reto o código CSS inválido.' });
    return;
  }

  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    const retoResult = await cliente.query(
      `SELECT r.id_reto, r.xp_recompensa, r.tipo_reto,
              n.id_nivel, n.id_lenguaje, n.numero_nivel
       FROM reto r
       INNER JOIN leccion l ON l.id_leccion = r.id_leccion
       INNER JOIN nivel n ON n.id_nivel = l.id_nivel
       INNER JOIN lenguaje lg ON lg.id_lenguaje = n.id_lenguaje
       WHERE r.id_reto = $1
         AND r.estado = TRUE
         AND LOWER(lg.nombre) = 'css'
       LIMIT 1`,
      [idReto]
    );

    if (!retoResult.rowCount) {
      await cliente.query('ROLLBACK');
      res.status(404).json({ status: 'error', message: 'La misión CSS no existe.' });
      return;
    }

    const reto = retoResult.rows[0];

    if (reto.tipo_reto !== 'codigo') {
      await cliente.query('ROLLBACK');
      res.status(400).json({ status: 'error', message: 'El reto indicado no es una misión de código.' });
      return;
    }

    const respuestaResult = await cliente.query(
      `SELECT contenido
       FROM respuesta
       WHERE id_reto = $1 AND es_correcta = TRUE
       ORDER BY id_respuesta
       LIMIT 1`,
      [idReto]
    );

    const solucion = respuestaResult.rows[0]?.contenido ?? '';
    const correcto = Boolean(solucion) && normalizarCss(codigo).includes(normalizarCss(solucion));

    const yaCompletadoResult = await cliente.query(
      `SELECT EXISTS(
         SELECT 1 FROM intento
         WHERE id_usuario = $1 AND id_reto = $2 AND correcto = TRUE
       ) AS completado`,
      [idUsuario, idReto]
    );
    const yaCompletado = Boolean(yaCompletadoResult.rows[0]?.completado);

    // El procedimiento registra el intento y otorga XP solo en el primer acierto.
    await cliente.query('CALL sp_crear_intento($1, $2, $3, $4, $5)', [
      idUsuario,
      idReto,
      codigo,
      correcto,
      0
    ]);

    let xpObtenida = 0;
    if (correcto && !yaCompletado) {
      xpObtenida = Number(reto.xp_recompensa || 0);

      // Marca el nivel actual como completado de forma idempotente.
      await cliente.query(
        `INSERT INTO nivel_usuario
           (id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado)
         VALUES ($1, $2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id_usuario, id_nivel)
         DO UPDATE SET
           desbloqueado = TRUE,
           completado = TRUE,
           fecha_desbloqueo = COALESCE(nivel_usuario.fecha_desbloqueo, CURRENT_TIMESTAMP),
           fecha_completado = COALESCE(nivel_usuario.fecha_completado, CURRENT_TIMESTAMP)`,
        [idUsuario, reto.id_nivel]
      );

      const siguienteResult = await cliente.query(
        `SELECT id_nivel, numero_nivel
         FROM nivel
         WHERE id_lenguaje = $1
           AND numero_nivel > $2
           AND estado = TRUE
         ORDER BY numero_nivel
         LIMIT 1`,
        [reto.id_lenguaje, reto.numero_nivel]
      );

      const siguiente = siguienteResult.rows[0] ?? null;

      if (siguiente) {
        await cliente.query(
          `INSERT INTO nivel_usuario
             (id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo)
           VALUES ($1, $2, TRUE, FALSE, CURRENT_TIMESTAMP)
           ON CONFLICT (id_usuario, id_nivel)
           DO UPDATE SET
             desbloqueado = TRUE,
             fecha_desbloqueo = COALESCE(nivel_usuario.fecha_desbloqueo, CURRENT_TIMESTAMP)`,
          [idUsuario, siguiente.id_nivel]
        );
      }

      // Porcentaje = niveles CSS completados / total de niveles CSS.
      const porcentajeResult = await cliente.query(
        `SELECT
           COUNT(*) FILTER (WHERE nu.completado = TRUE)::numeric /
           NULLIF(COUNT(*), 0) * 100 AS porcentaje
         FROM nivel n
         LEFT JOIN nivel_usuario nu
           ON nu.id_nivel = n.id_nivel AND nu.id_usuario = $1
         WHERE n.id_lenguaje = $2 AND n.estado = TRUE`,
        [idUsuario, reto.id_lenguaje]
      );

      const porcentaje = Number(porcentajeResult.rows[0]?.porcentaje || 0);
      const idNivelActual = siguiente?.id_nivel ?? reto.id_nivel;

      await cliente.query(
        `INSERT INTO progreso
           (id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje, fecha_actualizacion)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         ON CONFLICT (id_usuario, id_lenguaje)
         DO UPDATE SET
           id_nivel_actual = EXCLUDED.id_nivel_actual,
           porcentaje = EXCLUDED.porcentaje,
           fecha_actualizacion = CURRENT_TIMESTAMP`,
        [idUsuario, reto.id_lenguaje, idNivelActual, xpObtenida, porcentaje]
      );
    }

    const progresoResult = await cliente.query(
      `SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual,
              xp_actual, porcentaje, fecha_actualizacion
       FROM progreso
       WHERE id_usuario = $1 AND id_lenguaje = $2
       LIMIT 1`,
      [idUsuario, reto.id_lenguaje]
    );

    await cliente.query('COMMIT');

    res.status(201).json({
      status: 'success',
      data: {
        correcto,
        xp_obtenida: xpObtenida,
        ya_completado: yaCompletado,
        progreso: progresoResult.rows[0] ?? null
      }
    });
  } catch (error: any) {
    await cliente.query('ROLLBACK');
    console.error('Error al registrar intento CSS:', error?.message || error);
    res.status(500).json({ status: 'error', message: 'No se pudo registrar el intento CSS.' });
  } finally {
    cliente.release();
  }
};
