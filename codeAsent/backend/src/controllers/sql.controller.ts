import { Request, Response } from 'express';
import { pool } from '../config/conexion';

export const obtenerNivelesSql = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      res.status(401).json({ status: 'error', message: 'Usuario no autenticado.' });
      return;
    }

    // Repara instalaciones antiguas donde el catalogo SQL no se cargo completo.
    // No crea retos ni respuestas: esos contenidos deben venir de la base.
    await pool.query(`
      INSERT INTO lenguaje (nombre, descripcion, estado)
      SELECT 'SQL', 'Lenguaje estandar para la gestion de bases de datos relacionales.', TRUE
      WHERE NOT EXISTS (
        SELECT 1 FROM lenguaje WHERE LOWER(TRIM(nombre)) = 'sql'
      )
    `);

    await pool.query(`
      UPDATE lenguaje
      SET estado = TRUE
      WHERE LOWER(TRIM(nombre)) = 'sql'
    `);

    await pool.query(`
      INSERT INTO nivel (id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado)
      SELECT l.id_lenguaje, datos.nombre, datos.numero_nivel, datos.descripcion, datos.xp_requerida, TRUE
      FROM lenguaje l
      CROSS JOIN (VALUES
        ('Introducción a Bases de Datos', 1, 'Conceptos clave de modelos relacionales.', 50),
        ('Sentencia SELECT Básica', 2, 'Consultar filas y columnas específicas.', 100),
        ('Filtros con WHERE', 3, 'Uso de operadores lógicos y de comparación.', 150),
        ('Ordenamiento y Límites', 4, 'Aplicación de ORDER BY y LIMIT/OFFSET.', 200),
        ('Funciones de Agregación', 5, 'Uso de COUNT, SUM, AVG, MIN y MAX.', 250),
        ('Agrupamiento con GROUP BY', 6, 'Agrupar registros y filtrar con HAVING.', 300),
        ('Uniones con INNER JOIN', 7, 'Combinar información de múltiples tablas.', 350),
        ('Uniones Externas', 8, 'Manejo de registros no coincidentes.', 400),
        ('Subconsultas y CTEs', 9, 'Consultas anidadas y expresiones de tabla.', 450),
        ('Manipulación de Datos DML', 10, 'Uso avanzado de INSERT, UPDATE y DELETE.', 500)
      ) AS datos(nombre, numero_nivel, descripcion, xp_requerida)
      WHERE LOWER(TRIM(l.nombre)) = 'sql'
        AND NOT EXISTS (
          SELECT 1 FROM nivel n
          WHERE n.id_lenguaje = l.id_lenguaje
            AND n.numero_nivel = datos.numero_nivel
        )
    `);

      await pool.query(`
        UPDATE nivel n
        SET estado = TRUE
        FROM lenguaje l
        WHERE l.id_lenguaje = n.id_lenguaje
          AND LOWER(TRIM(l.nombre)) = 'sql'
      `);

      await pool.query(`
        INSERT INTO leccion (id_nivel, titulo, contenido, orden, estado)
        SELECT n.id_nivel,
               'Manual SQL - ' || n.nombre,
               COALESCE(n.descripcion, 'Estudia el concepto SQL de este nivel.'),
               1,
               TRUE
        FROM nivel n
        INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje
        WHERE LOWER(TRIM(l.nombre)) = 'sql'
          AND NOT EXISTS (SELECT 1 FROM leccion le WHERE le.id_nivel = n.id_nivel)
      `);

    const resultado = await pool.query(`
      WITH niveles_estado AS (
        SELECT
          n.id_nivel,
          n.id_lenguaje,
          n.nombre,
          n.numero_nivel,
          n.descripcion,
          n.xp_requerida,
          COALESCE(nu.completado, FALSE) AS completado,
          (
            n.numero_nivel = 1 OR NOT EXISTS (
              SELECT 1
              FROM nivel anterior
              LEFT JOIN nivel_usuario anterior_usuario
                ON anterior_usuario.id_nivel = anterior.id_nivel
               AND anterior_usuario.id_usuario = $1
              WHERE anterior.id_lenguaje = n.id_lenguaje
                AND anterior.numero_nivel < n.numero_nivel
                AND COALESCE(anterior_usuario.completado, FALSE) = FALSE
            )
          ) AS desbloqueado
        FROM nivel n
        LEFT JOIN nivel_usuario nu
          ON nu.id_nivel = n.id_nivel AND nu.id_usuario = $1
        INNER JOIN lenguaje le
          ON le.id_lenguaje = n.id_lenguaje
         AND LOWER(TRIM(le.nombre)) LIKE 'sql%'
      ),
      niveles_consecutivos AS (
        SELECT
          ne.*,
          CASE
            WHEN ne.completado THEN 'completada'
            WHEN ne.desbloqueado THEN 'en_progreso'
            ELSE 'bloqueada'
          END AS estado_progreso
        FROM niveles_estado ne
      )
      SELECT
        n.id_nivel,
        n.id_lenguaje,
        n.nombre,
        n.numero_nivel,
        n.descripcion,
        n.xp_requerida,
        n.desbloqueado,
        n.completado,
        n.estado_progreso,
        COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id_leccion', l.id_leccion,
            'titulo', l.titulo,
            'contenido', l.contenido,
            'manual_tecnico', l.manual_tecnico,
            'orden', l.orden,
            'ejemplos', COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id_ejemplo', e.id_ejemplo,
                'titulo', e.titulo,
                'codigo', e.codigo,
                'explicacion', e.explicacion
              ) ORDER BY e.id_ejemplo)
              FROM ejemplo e
              WHERE e.id_leccion = l.id_leccion
            ), '[]'::jsonb)
          ) ORDER BY l.orden)
          FROM leccion l
          WHERE l.id_nivel = n.id_nivel
        ), '[]'::jsonb) AS lecciones,
        COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id_reto', r.id_reto,
            'id_leccion', r.id_leccion,
            'titulo', r.titulo,
            'descripcion', r.descripcion,
                'contexto_abp', r.contexto_abp,
                'esquema_bd', r.esquema_bd,
              'pistas', COALESCE(r.pistas, '[]'::jsonb),
            'tipo_reto', r.tipo_reto,
            'xp_recompensa', r.xp_recompensa,
            'dificultad', r.dificultad,
            'respuestas', COALESCE((
              SELECT jsonb_agg(jsonb_build_object(
                'id_respuesta', rp.id_respuesta,
                'contenido', rp.contenido,
                'es_correcta', rp.es_correcta
              ) ORDER BY rp.id_respuesta)
              FROM respuesta rp
              WHERE rp.id_reto = r.id_reto
            ), '[]'::jsonb)
          ) ORDER BY r.id_reto)
          FROM reto r
          INNER JOIN leccion lr ON lr.id_leccion = r.id_leccion
          WHERE lr.id_nivel = n.id_nivel
        ), '[]'::jsonb) AS retos
      FROM niveles_consecutivos n
      ORDER BY n.numero_nivel ASC
    `, [idUsuario]);

    res.status(200).json({ status: 'success', data: resultado.rows });
  } catch (error: any) {
    console.error('Error al obtener niveles SQL:', error?.message || error);
    res.status(500).json({ status: 'error', message: 'No se pudieron cargar los niveles SQL.' });
  }
};

export const registrarRespuestaSql = async (req: Request, res: Response): Promise<void> => {
  const idUsuario = req.usuario?.id_usuario;
  const idReto = Number(req.body?.id_reto);
  const respuestaUsuario = String(req.body?.respuesta_usuario ?? '');

  if (!idUsuario || !Number.isInteger(idReto) || !respuestaUsuario.trim()) {
    res.status(400).json({ status: 'error', message: 'El reto y la respuesta son obligatorios.' });
    return;
  }

  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    await cliente.query(`
      INSERT INTO logro (nombre, descripcion, xp_recompensa, requisito, estado)
      VALUES
        ('SQL: Primer Comando', 'Ejecuta correctamente tu primera misión SQL.', 25, 'Completar 1 misión SQL', TRUE),
        ('SQL: Operador de Datos', 'Domina cinco misiones del circuito SQL.', 75, 'Completar 5 misiones SQL', TRUE),
        ('SQL: Arquitecto del Valle', 'Completa las diez misiones SQL registradas.', 150, 'Completar 10 misiones SQL', TRUE)
      ON CONFLICT (nombre) DO UPDATE SET estado = TRUE
    `);

    const reto = await cliente.query(`
      SELECT r.id_reto, r.xp_recompensa, r.id_leccion, n.id_nivel,
             EXISTS (
               SELECT 1 FROM intento i
               WHERE i.id_usuario = $1 AND i.id_reto = r.id_reto AND i.correcto = TRUE
             ) AS ya_completado,
             EXISTS (
               SELECT 1 FROM respuesta rp
               WHERE rp.id_reto = r.id_reto
                 AND rp.es_correcta = TRUE
                 AND LOWER(TRIM(rp.contenido)) = LOWER(TRIM($2))
             ) AS correcto
      FROM reto r
      INNER JOIN leccion l ON l.id_leccion = r.id_leccion
      INNER JOIN nivel n ON n.id_nivel = l.id_nivel
      INNER JOIN lenguaje le ON le.id_lenguaje = n.id_lenguaje
      WHERE r.id_reto = $1 AND LOWER(le.nombre) = 'sql' AND r.estado = TRUE
    `, [idReto, respuestaUsuario]);

    if (reto.rows.length === 0) {
      await cliente.query('ROLLBACK');
      res.status(404).json({ status: 'error', message: 'El reto SQL no existe.' });
      return;
    }

    const datosReto = reto.rows[0];
    await cliente.query(
      'CALL sp_crear_intento($1, $2, $3, $4, $5)',
      [idUsuario, idReto, respuestaUsuario, datosReto.correcto, 0]
    );

    let nivelCompletado = false;
    const xpObtenida = datosReto.correcto && !datosReto.ya_completado
      ? Number(datosReto.xp_recompensa || 0)
      : 0;
    if (datosReto.correcto) {
      const avance = await cliente.query(`
        SELECT
          COUNT(r.id_reto)::int AS total_retos,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM intento i
              WHERE i.id_usuario = $1 AND i.id_reto = r.id_reto AND i.correcto = TRUE
            )
          )::int AS retos_completados
        FROM reto r
        INNER JOIN leccion l ON l.id_leccion = r.id_leccion
        WHERE l.id_nivel = $2 AND r.estado = TRUE
      `, [idUsuario, datosReto.id_nivel]);

      nivelCompletado = avance.rows[0].total_retos > 0 &&
        avance.rows[0].total_retos === avance.rows[0].retos_completados;

      if (nivelCompletado) {
        await cliente.query(`
          INSERT INTO nivel_usuario (id_usuario, id_nivel, desbloqueado, completado, fecha_desbloqueo, fecha_completado)
          VALUES ($1, $2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (id_usuario, id_nivel) DO UPDATE SET
            desbloqueado = TRUE,
            completado = TRUE,
            fecha_completado = COALESCE(nivel_usuario.fecha_completado, CURRENT_TIMESTAMP)
        `, [idUsuario, datosReto.id_nivel]);

        await cliente.query(`
          INSERT INTO nivel_usuario (id_usuario, id_nivel, desbloqueado, fecha_desbloqueo)
          SELECT $1, siguiente.id_nivel, TRUE, CURRENT_TIMESTAMP
          FROM nivel siguiente
          WHERE siguiente.id_lenguaje = (
            SELECT id_lenguaje FROM nivel WHERE id_nivel = $2
          ) AND siguiente.numero_nivel = (
            SELECT numero_nivel + 1 FROM nivel WHERE id_nivel = $2
          )
          ON CONFLICT (id_usuario, id_nivel) DO UPDATE SET desbloqueado = TRUE
        `, [idUsuario, datosReto.id_nivel]);
      }

      await cliente.query(`
        INSERT INTO progreso (id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje)
        SELECT $1, n.id_lenguaje, n.id_nivel,
               COALESCE((SELECT SUM(i.xp_obtenida)::int FROM intento i
                         INNER JOIN reto rr ON rr.id_reto = i.id_reto
                         INNER JOIN leccion ll ON ll.id_leccion = rr.id_leccion
                         INNER JOIN nivel nn ON nn.id_nivel = ll.id_nivel
                         WHERE i.id_usuario = $1 AND nn.id_lenguaje = n.id_lenguaje), 0),
               COALESCE((SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM nivel nv
                         WHERE nv.id_lenguaje = n.id_lenguaje AND nv.estado = TRUE), 0)
                         FROM nivel nv
                         LEFT JOIN nivel_usuario nvu ON nvu.id_nivel = nv.id_nivel AND nvu.id_usuario = $1
                         WHERE nv.id_lenguaje = n.id_lenguaje AND nv.estado = TRUE AND nvu.completado = TRUE), 0)
        FROM nivel n
        WHERE n.id_nivel = $2
        ON CONFLICT (id_usuario, id_lenguaje) DO UPDATE SET
          id_nivel_actual = EXCLUDED.id_nivel_actual,
          xp_actual = EXCLUDED.xp_actual,
          fecha_actualizacion = CURRENT_TIMESTAMP
      `, [idUsuario, datosReto.id_nivel]);

      await cliente.query(`
        WITH nuevos_logros AS (
          INSERT INTO usuario_logro (id_usuario, id_logro)
          SELECT $1, l.id_logro
          FROM logro l
          WHERE l.estado = TRUE
            AND (
              (l.nombre = 'SQL: Primer Comando' AND EXISTS (
                SELECT 1 FROM intento i
                INNER JOIN reto rr ON rr.id_reto = i.id_reto
                INNER JOIN leccion ll ON ll.id_leccion = rr.id_leccion
                INNER JOIN nivel nn ON nn.id_nivel = ll.id_nivel
                INNER JOIN lenguaje lg ON lg.id_lenguaje = nn.id_lenguaje
                WHERE i.id_usuario = $1 AND i.correcto = TRUE AND LOWER(lg.nombre) = 'sql'
              ))
              OR (l.nombre = 'SQL: Operador de Datos' AND (
                SELECT COUNT(DISTINCT i.id_reto) FROM intento i
                INNER JOIN reto rr ON rr.id_reto = i.id_reto
                INNER JOIN leccion ll ON ll.id_leccion = rr.id_leccion
                INNER JOIN nivel nn ON nn.id_nivel = ll.id_nivel
                INNER JOIN lenguaje lg ON lg.id_lenguaje = nn.id_lenguaje
                WHERE i.id_usuario = $1 AND i.correcto = TRUE AND LOWER(lg.nombre) = 'sql'
              )) >= 5)
              OR (l.nombre = 'SQL: Arquitecto del Valle' AND (
                SELECT COUNT(DISTINCT i.id_reto) FROM intento i
                INNER JOIN reto rr ON rr.id_reto = i.id_reto
                INNER JOIN leccion ll ON ll.id_leccion = rr.id_leccion
                INNER JOIN nivel nn ON nn.id_nivel = ll.id_nivel
                INNER JOIN lenguaje lg ON lg.id_lenguaje = nn.id_lenguaje
                WHERE i.id_usuario = $1 AND i.correcto = TRUE AND LOWER(lg.nombre) = 'sql'
              )) >= 10)
            )
          ON CONFLICT (id_usuario, id_logro) DO NOTHING
          RETURNING id_logro
        )
        UPDATE progreso p
        SET xp_actual = COALESCE(p.xp_actual, 0) + COALESCE((
          SELECT SUM(l.xp_recompensa) FROM nuevos_logros nl
          INNER JOIN logro l ON l.id_logro = nl.id_logro
        ), 0), fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE p.id_usuario = $1
          AND p.id_lenguaje = (SELECT n.id_lenguaje FROM nivel n WHERE n.id_nivel = $2)
      `, [idUsuario, datosReto.id_nivel]);
    }

    await cliente.query('COMMIT');
    res.status(200).json({
      status: 'success',
      data: {
        correcto: datosReto.correcto,
        nivelCompletado,
        xpObtenida,
        xpTotal: Number((await cliente.query(
          `SELECT COALESCE(xp_actual, 0)::int AS xp_total
           FROM progreso p
           INNER JOIN lenguaje l ON l.id_lenguaje = p.id_lenguaje
           WHERE p.id_usuario = $1 AND LOWER(l.nombre) = 'sql'`,
          [idUsuario]
        )).rows[0]?.xp_total || 0)
      }
    });
  } catch (error: any) {
    await cliente.query('ROLLBACK');
    console.error('Error al registrar respuesta SQL:', error?.message || error);
    res.status(500).json({ status: 'error', message: 'No se pudo registrar la respuesta SQL.' });
  } finally {
    cliente.release();
  }
};
