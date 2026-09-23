import { Request, Response } from 'express';
import { pool } from '../config/conexion';

export const obtenerResumenDashboard = async (req: Request, res: Response) => {
  try {
    const idUsuario = req.usuario?.id_usuario;

    if (!idUsuario) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado.' });
    }

    // Auto-corrige SQL a 100 XP por nivel (máximo 1000) si la BD aún tiene 50..500 (5500 total)
    await pool.query(`
      UPDATE nivel SET xp_requerida = 100
      WHERE id_lenguaje IN (SELECT id_lenguaje FROM lenguaje WHERE slug = 'sql' OR LOWER(nombre)='sql')
        AND xp_requerida != 100
    `);
    // Corrige XP de usuario SQL si quedó desfasado por premios viejos (solo corrige al alza, nunca resta para no confundir)
    await pool.query(`
      UPDATE usuario_xp SET xp = LEAST(1000, (
        SELECT COUNT(*) * 100 FROM mission_progress mp
        JOIN leccion l ON l.id_leccion = mp.mission_id
        JOIN nivel n ON n.id_nivel = l.id_nivel
        JOIN lenguaje lang ON lang.id_lenguaje = n.id_lenguaje
        WHERE mp.user_id = usuario_xp.user_id AND mp.completed = TRUE AND lang.slug='sql'
      ))
      WHERE id_lenguaje IN (SELECT id_lenguaje FROM lenguaje WHERE slug='sql' OR LOWER(nombre)='sql')
        AND xp < LEAST(1000, (
        SELECT COUNT(*) * 100 FROM mission_progress mp2
        JOIN leccion l2 ON l2.id_leccion = mp2.mission_id
        JOIN nivel n2 ON n2.id_nivel = l2.id_nivel
        JOIN lenguaje lang2 ON lang2.id_lenguaje = n2.id_lenguaje
        WHERE mp2.user_id = usuario_xp.user_id AND mp2.completed = TRUE AND lang2.slug='sql'
      ))
    `);
    // Asegura que nunca supere 1000 (por si quedó 2750 de instalación vieja)
    await pool.query(`
      UPDATE usuario_xp SET xp = 1000 WHERE xp > 1000 AND id_lenguaje IN (SELECT id_lenguaje FROM lenguaje WHERE slug='sql' OR LOWER(nombre)='sql')
    `);

    // 1. Obtener Usuario
    const resUsuario = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, fecha_registro FROM usuario WHERE id_usuario = $1',
      [idUsuario]
    );

    if (resUsuario.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const usuario = resUsuario.rows[0];

    // 2. Obtener Progreso General
    let progreso = {
      id_usuario: usuario.id_usuario,
      id_lenguaje: 1,
      id_nivel_actual: 1,
      xp_actual: 0,
      porcentaje: 0
    };

    const resProgreso = await pool.query(
      'SELECT id_progreso, id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje FROM progreso WHERE id_usuario = $1 LIMIT 1',
      [idUsuario]
    );

    if (resProgreso.rows.length > 0) {
      progreso = resProgreso.rows[0];
    }

    const resProgresoSql = await pool.query(`
      SELECT p.id_progreso, p.id_usuario, p.id_lenguaje, p.id_nivel_actual, p.xp_actual, p.porcentaje
      FROM progreso p
      INNER JOIN lenguaje l ON l.id_lenguaje = p.id_lenguaje
      WHERE p.id_usuario = $1 AND LOWER(l.nombre) = 'sql'
      LIMIT 1
    `, [idUsuario]);
    const progresoSql = resProgresoSql.rows[0] || null;

    // 3. Contar Logros Obtenidos Reales
    const resLogros = await pool.query(
      'SELECT COUNT(*)::int AS total FROM usuario_logro WHERE id_usuario = $1',
      [idUsuario]
    );
    const logrosObtenidos = resLogros.rows[0]?.total || 0;

    const resPerfil = await pool.query(`
      SELECT
        l.id_lenguaje,
        l.nombre,
        l.slug,
        l.descripcion,
        COALESCE(uxp.xp, 0)::int AS xp_actual,
        COALESCE((
          SELECT MAX(nivel.numero_nivel)
          FROM nivel nivel
          WHERE nivel.id_lenguaje = l.id_lenguaje
            AND CASE WHEN l.slug = 'sql' THEN nivel.numero_nivel * 100 ELSE (
              SELECT COALESCE(SUM(anterior.xp_requerida), 0)
              FROM nivel anterior
              WHERE anterior.id_lenguaje = l.id_lenguaje
                AND anterior.numero_nivel <= nivel.numero_nivel
            ) END <= COALESCE(uxp.xp, 0)
        ), 1)::int AS nivel_actual,
        CASE WHEN l.slug = 'sql' THEN LEAST(100, ROUND((COALESCE(uxp.xp, 0)::numeric / 1000) * 100, 2))
             ELSE LEAST(100, ROUND((COALESCE(uxp.xp, 0)::numeric / NULLIF(SUM(n.xp_requerida), 0)) * 100, 2)) END::float AS porcentaje,
        COUNT(DISTINCT n.id_nivel)::int AS total_niveles
      FROM lenguaje l
      LEFT JOIN usuario_xp uxp
        ON uxp.id_lenguaje = l.id_lenguaje AND uxp.user_id = $1
      LEFT JOIN nivel n ON n.id_lenguaje = l.id_lenguaje AND n.estado = TRUE
      WHERE l.estado = TRUE
      GROUP BY l.id_lenguaje, l.nombre, l.slug, l.descripcion, uxp.xp
      ORDER BY l.id_lenguaje
    `, [idUsuario]);

    const resEstadisticas = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM nivel_usuario WHERE id_usuario = $1 AND completado = TRUE) AS niveles_completados,
        (SELECT COUNT(DISTINCT id_reto)::int FROM intento WHERE id_usuario = $1 AND correcto = TRUE) AS retos_superados,
        (SELECT COALESCE(SUM(xp), 0)::int FROM usuario_xp WHERE user_id = $1) AS xp_total,
        (SELECT COUNT(*)::int FROM intento WHERE id_usuario = $1) AS intentos_totales,
        (SELECT COUNT(*)::int FROM intento WHERE id_usuario = $1 AND correcto = TRUE) AS intentos_correctos
    `, [idUsuario]);

    const resActividad = await pool.query(`
      SELECT TO_CHAR(fecha_intento::date, 'YYYY-MM-DD') AS fecha,
             COALESCE(SUM(xp_obtenida), 0)::int AS xp
      FROM intento
      WHERE id_usuario = $1 AND fecha_intento >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY fecha_intento::date
      ORDER BY fecha_intento::date
    `, [idUsuario]);

    const resLogrosPerfil = await pool.query(`
      SELECT l.id_logro, l.nombre, COALESCE(l.titulo, l.nombre) AS titulo,
             l.descripcion, l.dificultad, l.id_lenguaje,
             (ul.id_usuario_logro IS NOT NULL) AS obtenido,
             ul.fecha_obtenido
      FROM logro l
      LEFT JOIN usuario_logro ul
        ON ul.id_logro = l.id_logro AND ul.id_usuario = $1
      ORDER BY l.dificultad, l.id_logro
    `, [idUsuario]);

    const estadisticas = resEstadisticas.rows[0] || {};
    const intentosTotales = Number(estadisticas.intentos_totales || 0);
    const intentosCorrectos = Number(estadisticas.intentos_correctos || 0);

    // 4. Obtener los lenguajes FORZANDO el orden del juego: HTML -> CSS -> SQL -> TypeScript
    const resLenguajes = await pool.query(`
      SELECT id_lenguaje, nombre 
      FROM lenguaje 
      WHERE estado = TRUE 
      ORDER BY CASE LOWER(nombre)
        WHEN 'html' THEN 1
        WHEN 'css' THEN 2
        WHEN 'sql' THEN 3
        WHEN 'typescript' THEN 4
        ELSE 5
      END ASC
    `);

    // Coordenadas SVG para los 4 nodos en el mapa de depuración
    const posiciones = [
      { left: '8%', top: '78%' },
      { left: '38%', top: '64%' },
      { left: '62%', top: '64%' },
      { left: '90%', top: '42%' }
    ];

    const iconosLenguaje: Record<string, string> = {
      'HTML': 'bi-filetype-html',
      'CSS': 'bi-filetype-css',
      'SQL': 'bi-database-fill-gear',
      'TypeScript': 'bi-filetype-tsx'
    };

    // Mapear progresos por id_lenguaje
    const resProgresosUser = await pool.query(
      'SELECT id_lenguaje, porcentaje FROM progreso WHERE id_usuario = $1',
      [idUsuario]
    );

    const mapProgresos = new Map<number, number>();
    resProgresosUser.rows.forEach((p: any) => mapProgresos.set(p.id_lenguaje, p.porcentaje));

    // Construir los nodos en la secuencia exacta requerida
    const nodosMapa = resLenguajes.rows.map((lenguaje: any, index: number) => {
      const porcentajeLenguaje = mapProgresos.get(lenguaje.id_lenguaje) || 0;

      let estado: 'unlocked' | 'current' | 'locked' = 'locked';
      let subtexto = 'Bloqueado';

      if (porcentajeLenguaje >= 100) {
        estado = 'unlocked';
        subtexto = 'Purificado';
      } else if (porcentajeLenguaje > 0 || index === 0) {
        // HTML (índice 0) inicia desbloqueado/en infección por defecto
        estado = 'current';
        subtexto = 'En Infección';
      }

      return {
        id: lenguaje.id_lenguaje.toString(),
        titulo: lenguaje.nombre,
        estado: estado,
        subtexto: subtexto,
        icono: iconosLenguaje[lenguaje.nombre] || 'bi-code-slash',
        posicion: posiciones[index % posiciones.length]
      };
    });

    const resMisiones = await pool.query(`
  SELECT
    n.id_nivel,
    n.numero_nivel,
    n.nombre,
    n.descripcion,
    n.xp_requerida,

    le.id_leccion,
    le.titulo AS leccion_titulo,
    le.contenido AS leccion_contenido,

    r.id_reto,
    r.titulo AS reto_titulo,
    r.descripcion AS reto_descripcion,
    r.tipo_reto,
    r.xp_recompensa,
    r.dificultad,

    resp.id_respuesta,
    resp.contenido AS respuesta_contenido,
    resp.es_correcta

  FROM nivel n

  INNER JOIN lenguaje l
    ON l.id_lenguaje = n.id_lenguaje

  LEFT JOIN leccion le
    ON le.id_nivel = n.id_nivel
    AND le.estado = TRUE

  LEFT JOIN reto r
    ON r.id_leccion = le.id_leccion
    AND r.estado = TRUE

  LEFT JOIN respuesta resp
    ON resp.id_reto = r.id_reto

  WHERE LOWER(l.nombre) = 'typescript'
    AND n.estado = TRUE

  ORDER BY
    n.numero_nivel ASC,
    le.orden ASC NULLS LAST,
    r.id_reto ASC,
    resp.id_respuesta ASC
`);

    const misionesMap = new Map<number, any>();

    for (const fila of resMisiones.rows) {

      if (!misionesMap.has(fila.id_nivel)) {

        misionesMap.set(fila.id_nivel, {
          id_nivel: fila.id_nivel,
          numero_nivel: fila.numero_nivel,
          nombre: fila.nombre,
          descripcion: fila.descripcion,
          xp_requerida: fila.xp_requerida,

          leccion: fila.id_leccion
            ? {
              id_leccion: fila.id_leccion,
              titulo: fila.leccion_titulo,
              contenido: fila.leccion_contenido
            }
            : null,

          reto: fila.id_reto
            ? {
              id_reto: fila.id_reto,
              titulo: fila.reto_titulo,
              descripcion: fila.reto_descripcion,
              tipo_reto: fila.tipo_reto,
              xp_recompensa: fila.xp_recompensa,
              dificultad: fila.dificultad,
              respuestas: []
            }
            : null
        });
      }

      const mision = misionesMap.get(fila.id_nivel);

      if (
        fila.id_respuesta &&
        mision?.reto
      ) {
        mision.reto.respuestas.push({
          id_respuesta: fila.id_respuesta,
          contenido: fila.respuesta_contenido,
          es_correcta: fila.es_correcta
        });
      }
    }

    const misiones = Array.from(
      misionesMap.values()
    );

    return res.json({
      usuario,
      progreso,
      progresoSql,
      logrosObtenidos,
      perfil: {
        lenguajes: resPerfil.rows,
        estadisticas: {
          nivelesCompletados: Number(estadisticas.niveles_completados || 0),
          retosSuperados: Number(estadisticas.retos_superados || 0),
          xpTotal: Number(estadisticas.xp_total || 0),
          precision: intentosTotales ? Math.round((intentosCorrectos / intentosTotales) * 100) : 0
        },
        actividadSemanal: resActividad.rows,
        logros: resLogrosPerfil.rows
      },
      nodosMapa,

      misiones
    });

  } catch (error: any) {
    console.error('❌ Error en dashboard.controller:', error?.message || error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
