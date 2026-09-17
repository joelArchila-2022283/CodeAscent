import { Request, Response } from 'express';
import { pool } from '../config/conexion';

interface RequestAutenticado extends Request {
  id_usuario?: number;
}

export const obtenerResumenDashboard = async (req: RequestAutenticado, res: Response) => {
  try {
    const idUsuario = req.id_usuario || 1;

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

    return res.json({
      usuario,
      progreso,
      progresoSql,
      logrosObtenidos,
      nodosMapa
    });

  } catch (error: any) {
    console.error('❌ Error en dashboard.controller:', error?.message || error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};