import { PoolClient } from 'pg';
import { pool } from '../config/conexion';

export interface NivelGamificacion {
    id_nivel: number;
    nombre: string;
    numero_nivel: number;
    xp_requerida: number;
}

export class GamificationService {
    static async getNiveles(
        db: typeof pool | PoolClient,
        idLenguaje: number
    ): Promise<NivelGamificacion[]> {
        const resultado = await db.query<NivelGamificacion>(
            `SELECT id_nivel, nombre, numero_nivel, xp_requerida
             FROM nivel
             WHERE id_lenguaje = $1 AND estado = TRUE
             ORDER BY numero_nivel`,
            [idLenguaje]
        );
        return resultado.rows.map((nivel) => ({
            ...nivel,
            xp_requerida: Number(nivel.numero_nivel) * 100,
        }));
    }

    static computeLevel(xp: number, niveles: NivelGamificacion[]) {
        let acumulado = 0;
        let actual = niveles[0] ?? null;

        for (const nivel of niveles) {
            const costo = Number(nivel.xp_requerida) || 0;
            if (xp >= acumulado + costo) {
                acumulado += costo;
                actual = nivel;
            } else {
                break;
            }
        }

        const siguiente = niveles.find(nivel => nivel.numero_nivel === (actual?.numero_nivel ?? 0) + 1);
        const base = siguiente ? acumulado : Math.max(0, acumulado - (actual?.xp_requerida ?? 0));
        const objetivo = siguiente?.xp_requerida ?? actual?.xp_requerida ?? 0;
        const porcentaje = objetivo > 0 ? Math.min(100, Math.round(((xp - base) / objetivo) * 100)) : 100;

        return { actual, siguiente, acumulado, porcentaje: Math.max(0, porcentaje) };
    }

    static async evaluateAchievements(client: PoolClient, userId: number, idLenguaje: number) {
        await client.query(
            `INSERT INTO usuario_logro (id_usuario, id_logro)
             SELECT $1, l.id_logro
             FROM logro l
             WHERE l.id_lenguaje IS NULL
               AND l.nombre IN ('Primer Paso', 'Mente Brillante')
               AND (
                 (l.nombre = 'Primer Paso' AND EXISTS (
                   SELECT 1 FROM mission_progress WHERE user_id = $1 AND completed = TRUE
                 ))
                 OR (l.nombre = 'Mente Brillante' AND EXISTS (
                   SELECT 1 FROM mission_progress
                   WHERE user_id = $1 AND completed = TRUE AND first_try_perfect = TRUE
                 ))
               )
             ON CONFLICT (id_usuario, id_logro) DO NOTHING`,
            [userId]
        );

        await client.query(
            `INSERT INTO usuario_logro (id_usuario, id_logro)
             SELECT $1, l.id_logro
             FROM logro l
             WHERE l.id_lenguaje = $2
               AND (l.codigo LIKE 'lang_%_maestro' OR l.nombre ILIKE 'Maestro de %')
               AND (
                 SELECT COUNT(*) FROM leccion le
                 JOIN nivel n ON n.id_nivel = le.id_nivel
                 WHERE n.id_lenguaje = $2
               ) > 0
               AND (
                 SELECT COUNT(*) FROM mission_progress mp
                 JOIN leccion le ON le.id_leccion = mp.mission_id
                 JOIN nivel n ON n.id_nivel = le.id_nivel
                 WHERE mp.user_id = $1 AND mp.completed = TRUE AND n.id_lenguaje = $2
               ) = (
                 SELECT COUNT(*) FROM leccion le
                 JOIN nivel n ON n.id_nivel = le.id_nivel
                 WHERE n.id_lenguaje = $2
               )
             ON CONFLICT (id_usuario, id_logro) DO NOTHING`,
            [userId, idLenguaje]
        );

        const resultado = await client.query(
            `SELECT l.id_logro, l.codigo, COALESCE(l.titulo, l.nombre) AS titulo,
                    l.descripcion, l.dificultad,
                    (ul.id_usuario_logro IS NOT NULL) AS obtenido
             FROM logro l
             LEFT JOIN usuario_logro ul
               ON ul.id_logro = l.id_logro AND ul.id_usuario = $1
             WHERE l.id_lenguaje IS NULL OR l.id_lenguaje = $2
             ORDER BY l.dificultad, l.id_logro`,
            [userId, idLenguaje]
        );
        return resultado.rows;
    }

    static async obtenerGamificacion(userId: number, idLenguaje: number) {
        const client = await pool.connect();
        try {
            const niveles = await this.getNiveles(client, idLenguaje);
            const [xpResult, logros] = await Promise.all([
                client.query<{ xp: number }>(
                    `SELECT COALESCE(xp, 0)::int AS xp FROM usuario_xp
                     WHERE user_id = $1 AND id_lenguaje = $2`,
                    [userId, idLenguaje]
                ),
                this.evaluateAchievements(client, userId, idLenguaje)
            ]);
            const xpTotal = Number(xpResult.rows[0]?.xp ?? 0);
            return { xpTotal, ...this.computeLevel(xpTotal, niveles), logros };
        } finally {
            client.release();
        }
    }
}
