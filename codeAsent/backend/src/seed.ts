import { pool } from './config/conexion';

const preguntasPorMision = (slug: string, titulo: string) => slug === 'css' ? [
  {
    pregunta: `¿Qué selector o propiedad CSS es central en la misión «${titulo}»?`,
    correcta: `La regla CSS que selecciona el elemento objetivo y aplica la propiedad solicitada en «${titulo}».`,
    incorrecta1: 'Una etiqueta HTML nueva que sustituye la hoja de estilos.',
    incorrecta2: 'Un valor aleatorio que no guarda relación con el elemento objetivo.'
  },
  {
    pregunta: `¿Qué debes comprobar al resolver «${titulo}»?`,
    correcta: 'Que el selector alcance el elemento correcto y que la propiedad produzca el cambio visual esperado.',
    incorrecta1: 'Que la regla tenga muchas declaraciones aunque no cambie el resultado.',
    incorrecta2: 'Que el navegador ignore los estilos anteriores.'
  },
  {
    pregunta: `¿Cómo se escribe correctamente una solución para «${titulo}»?`,
    correcta: 'Con un selector CSS, llaves y declaraciones formadas por propiedad, dos puntos, valor y punto y coma.',
    incorrecta1: 'Con etiquetas HTML dentro de una declaración CSS.',
    incorrecta2: 'Con valores sin propiedad ni selector.'
  }
] : [
  {
    pregunta: `¿Cuál es la idea central que se debe comprender en ${titulo}?`,
    correcta: `Aplicar ${titulo} para expresar una estructura o comportamiento con significado.`,
    incorrecta1: 'Cambiar solamente la apariencia sin considerar la estructura.',
    incorrecta2: 'Evitar el concepto y copiar cualquier resultado visible.'
  },
  {
    pregunta: `¿Qué decisión lógica ayuda a resolver una misión de ${slug.toUpperCase()} sobre ${titulo}?`,
    correcta: 'Relacionar el objetivo de la misión con los datos, elementos o reglas que intervienen.',
    incorrecta1: 'Elegir una respuesta al azar antes de leer el problema.',
    incorrecta2: 'Usar una regla de otro lenguaje sin analizar el contexto.'
  },
  {
    pregunta: `¿Qué deberías comprobar antes de considerar completa la misión ${titulo}?`,
    correcta: 'Que la solución produzca el comportamiento solicitado y respete la estructura esperada.',
    incorrecta1: 'Que el código tenga más líneas que el ejemplo.',
    incorrecta2: 'Que el navegador o editor muestre un color específico.'
  },
  {
    pregunta: `¿Qué relación existe entre el concepto y la sintaxis en ${titulo}?`,
    correcta: 'La sintaxis representa una decisión conceptual que debe poder explicarse.',
    incorrecta1: 'La sintaxis reemplaza la necesidad de entender el problema.',
    incorrecta2: 'La sintaxis funciona igual aunque cambie el objetivo.'
  },
  {
    pregunta: `¿Cuál es la mejor forma de razonar una solución para ${titulo}?`,
    correcta: 'Predecir el resultado, ejecutar y comparar la evidencia con el objetivo de la misión.',
    incorrecta1: 'Ejecutar repetidamente sin formular una hipótesis.',
    incorrecta2: 'Aceptar cualquier salida que no produzca un error visible.'
  }
];

async function runSeed() {
  console.log('🚀 Iniciando proceso de migración y sembrado de base de datos...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Alteración de la tabla lenguaje para añadir slug
    console.log('1. Creando columna slug en lenguaje...');
    await client.query(`
      ALTER TABLE lenguaje ADD COLUMN IF NOT EXISTS slug VARCHAR(50);
    `);

    await client.query(`
      UPDATE lenguaje SET slug = LOWER(nombre) WHERE slug IS NULL OR slug = '';
    `);

    await client.query(`
      UPDATE lenguaje SET slug = 'html' WHERE LOWER(nombre) LIKE '%html%';
    `);
    await client.query(`
      UPDATE lenguaje SET slug = 'css' WHERE LOWER(nombre) LIKE '%css%';
    `);
    await client.query(`
      UPDATE lenguaje SET slug = 'typescript' WHERE LOWER(nombre) LIKE '%typescript%' OR LOWER(nombre) LIKE '%ts%';
    `);
    await client.query(`
      UPDATE lenguaje SET slug = 'sql' WHERE LOWER(nombre) LIKE '%sql%';
    `);

    await client.query(`
      ALTER TABLE lenguaje ALTER COLUMN slug SET NOT NULL;
    `);

    const uqExists = await client.query(`
      SELECT 1 FROM pg_constraint WHERE conname = 'uq_lenguaje_slug';
    `);
    if (uqExists.rowCount === 0) {
      await client.query(`
        ALTER TABLE lenguaje ADD CONSTRAINT uq_lenguaje_slug UNIQUE (slug);
      `);
    }

    // 2. Tabla mission_progress
    console.log('2. Creando tabla mission_progress...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS mission_progress (
          user_id INTEGER NOT NULL,
          mission_id INTEGER NOT NULL,
          reached_step VARCHAR(20) NOT NULL DEFAULT 'manual',
          completed BOOLEAN NOT NULL DEFAULT FALSE,
          prediccion_correcta BOOLEAN NOT NULL DEFAULT FALSE,
          pistas_usadas INTEGER NOT NULL DEFAULT 0,
          first_try_perfect BOOLEAN NOT NULL DEFAULT FALSE,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT pk_mission_progress PRIMARY KEY (user_id, mission_id),
          CONSTRAINT fk_mission_user FOREIGN KEY (user_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
          CONSTRAINT fk_mission_leccion FOREIGN KEY (mission_id) REFERENCES leccion(id_leccion) ON DELETE CASCADE,
          CONSTRAINT chk_reached_step CHECK (reached_step IN ('manual', 'lesson', 'terminal', 'quiz'))
      );
    `);

    // 3. Tabla usuario_xp
    console.log('3. Creando tabla usuario_xp...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuario_xp (
          user_id INTEGER NOT NULL,
          id_lenguaje INTEGER NOT NULL,
          xp INTEGER NOT NULL DEFAULT 0,
          CONSTRAINT pk_usuario_xp PRIMARY KEY (user_id, id_lenguaje),
          CONSTRAINT fk_uxp_user FOREIGN KEY (user_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
          CONSTRAINT fk_uxp_lenguaje FOREIGN KEY (id_lenguaje) REFERENCES lenguaje(id_lenguaje) ON DELETE CASCADE
      );
    `);

    // 4. Tablas de logros (Hacer ON CONFLICT DO NOTHING sobre nombre o usar INSERT ... ON CONFLICT (nombre))
    console.log('4. Adaptando o creando tablas de logros...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS logro (
          id_logro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          id_lenguaje INTEGER REFERENCES lenguaje(id_lenguaje) ON DELETE CASCADE,
          codigo VARCHAR(100),
          nombre VARCHAR(100) NOT NULL UNIQUE,
          titulo VARCHAR(150),
          descripcion TEXT,
          requisito VARCHAR(100) DEFAULT 'completar',
          dificultad VARCHAR(20) NOT NULL DEFAULT 'facil',
          CONSTRAINT chk_logro_dificultad CHECK (dificultad IN ('facil', 'intermedio', 'dificil', 'legendario'))
      );
    `);

    await client.query(`
      ALTER TABLE logro ADD COLUMN IF NOT EXISTS id_lenguaje INTEGER REFERENCES lenguaje(id_lenguaje) ON DELETE CASCADE;
    `);
    await client.query(`
      ALTER TABLE logro ADD COLUMN IF NOT EXISTS codigo VARCHAR(100);
    `);
    await client.query(`
      ALTER TABLE logro ADD COLUMN IF NOT EXISTS titulo VARCHAR(150);
    `);
    await client.query(`
      ALTER TABLE logro ADD COLUMN IF NOT EXISTS dificultad VARCHAR(20) NOT NULL DEFAULT 'facil';
    `);

    await client.query(`
      UPDATE logro SET codigo = 'logro_' || id_logro WHERE codigo IS NULL OR codigo = '';
    `);
    await client.query(`
      UPDATE logro SET titulo = nombre WHERE (titulo IS NULL OR titulo = '') AND nombre IS NOT NULL;
    `);

    // Inserción segura con ON CONFLICT (nombre)
    await client.query(`
      INSERT INTO logro (id_lenguaje, codigo, titulo, nombre, requisito, descripcion, dificultad) VALUES
      (NULL, 'global_primer_paso', 'Primer Paso', 'Primer Paso', 'completar', 'Completa tu primera misión en cualquier lenguaje.', 'facil'),
      (NULL, 'global_perfeccionista', 'Mente Brillante', 'Mente Brillante', 'completar', 'Supera un cuestionario al primer intento sin fallos.', 'intermedio')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO logro (id_lenguaje, codigo, titulo, nombre, requisito, descripcion, dificultad)
      SELECT l.id_lenguaje, 'lang_' || l.slug || '_maestro', 'Maestro de ' || l.nombre, 'Maestro de ' || l.nombre, 'completar', 'Completa todas las misiones de ' || l.nombre, 'legendario'
      FROM lenguaje l
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 5. Tabla de pistas
    console.log('5. Creando tabla pista...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS pista (
          id_pista INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          id_leccion INTEGER NOT NULL,
          orden INTEGER NOT NULL,
          texto TEXT NOT NULL,
          CONSTRAINT fk_pista_leccion FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion) ON DELETE CASCADE,
          CONSTRAINT uq_pista_leccion_orden UNIQUE (id_leccion, orden),
          CONSTRAINT chk_orden_pista CHECK (orden BETWEEN 1 AND 5)
      );
    `);

    // 6. Tablas de predicción
    console.log('6. Creando tablas de predicción...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS prediccion (
          id_prediccion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          id_leccion INTEGER NOT NULL UNIQUE,
          pregunta TEXT NOT NULL,
          CONSTRAINT fk_prediccion_leccion FOREIGN KEY (id_leccion) REFERENCES leccion(id_leccion) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS prediccion_opcion (
          id_opcion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          id_prediccion INTEGER NOT NULL,
          texto TEXT NOT NULL,
          es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
          CONSTRAINT fk_opcion_prediccion FOREIGN KEY (id_prediccion) REFERENCES prediccion(id_prediccion) ON DELETE CASCADE
      );
    `);

    // 7. Niveles
    console.log('7. Creando niveles de progreso...');
    const lenguajes = await client.query('SELECT id_lenguaje, nombre, slug FROM lenguaje');
    for (const r_lang of lenguajes.rows) {
      for (let i = 1; i <= 10; i++) {
        const v_costo = i * 100;
        await client.query(`
          INSERT INTO nivel (id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida, estado)
          VALUES ($1, $2, $3, $4, $5, TRUE)
          ON CONFLICT (id_lenguaje, numero_nivel) 
          DO UPDATE SET xp_requerida = EXCLUDED.xp_requerida;
        `, [
          r_lang.id_lenguaje,
          `Nivel ${i} (${r_lang.nombre})`,
          i,
          `Nivel de progresión ${i}`,
          v_costo
        ]);
      }
    }

    // 8. Sembrar pistas y predicciones
    console.log('8. Sembrando pistas, predicciones y opciones...');

    for (const slug of ['html', 'css', 'sql', 'typescript']) {
      const langRes = await client.query('SELECT id_lenguaje FROM lenguaje WHERE slug = $1', [slug]);
      if (langRes.rowCount === 0) continue;
      const id_lenguaje = langRes.rows[0].id_lenguaje;

      const misionesRes = await client.query(`
        SELECT l.id_leccion, ROW_NUMBER() OVER (ORDER BY n.numero_nivel, l.orden) AS num
        FROM nivel n
        JOIN leccion l ON n.id_nivel = l.id_nivel
        WHERE n.id_lenguaje = $1
        ORDER BY n.numero_nivel, l.orden
      `, [id_lenguaje]);

      if (misionesRes.rowCount === 0) continue;

      for (const row of misionesRes.rows) {
        const id_leccion = row.id_leccion;
        const num = Number(row.num);

        await client.query('DELETE FROM pista WHERE id_leccion = $1', [id_leccion]);
        await client.query('DELETE FROM prediccion WHERE id_leccion = $1', [id_leccion]);

        const leccionResult = await client.query<{ titulo: string }>(
          'SELECT titulo FROM leccion WHERE id_leccion = $1',
          [id_leccion]
        );
        const titulo = leccionResult.rows[0]?.titulo ?? `Misión ${num}`;
        const tema = titulo.toLowerCase();
        const pistas = [
          `¿Qué problema concreto resuelve el tema «${titulo}» dentro del lenguaje ${slug.toUpperCase()}?`,
          `¿Qué información entra y qué resultado debería poder observarse al trabajar con ${tema}?`,
          `¿Qué relación lógica deben conservar las partes de una solución sobre ${tema}?`,
          `¿Cómo comprobarías que tu solución cumple el objetivo y no solo produce una salida aparente?`,
          `¿Qué detalle de la sintaxis revisarías primero si el comportamiento esperado no aparece?`
        ];
        if (slug === 'html' && num === 7) {
          pistas[2] = '¿Qué tienen algo en común la indicación del campo y el control que recibe el dato?';
          pistas[4] = 'Revisa si la coincidencia exacta entre ambas referencias permite que la relación funcione.';
        }

        for (let orden = 1; orden <= 5; orden++) {
          await client.query(`
            INSERT INTO pista (id_leccion, orden, texto)
            VALUES ($1, $2, $3)
          `, [id_leccion, orden, pistas[orden - 1]]);
        }

        const pregunta_pred = slug === 'html' && num === 6
          ? '¿Qué significado estructural aporta una celda de encabezado y cómo ayuda a un lector de pantalla?'
          : `Antes de ejecutar, ¿qué comportamiento esperas obtener al resolver «${titulo}»?`;
        const predRes = await client.query(`
          INSERT INTO prediccion (id_leccion, pregunta)
          VALUES ($1, $2)
          RETURNING id_prediccion
        `, [id_leccion, pregunta_pred]);

        const id_prediccion = predRes.rows[0].id_prediccion;

        await client.query(`
          INSERT INTO prediccion_opcion (id_prediccion, texto, es_correcta)
          VALUES 
          ($1, $2, TRUE),
          ($1, $3, FALSE),
          ($1, $4, FALSE)
        `, [
          id_prediccion,
          'Opción correcta centrada en el comportamiento o significado semántico.',
          'Opción incorrecta centrada en un estilo visual secundario por defecto.',
          'Opción incorrecta alejada del comportamiento o regla pedagógica.'
        ]);

        const preguntas = preguntasPorMision(slug, titulo);
        const retosActuales = await client.query<{ total: number }>(
          `SELECT COUNT(*)::int AS total FROM reto
           WHERE id_leccion = $1 AND tipo_reto = 'opcion_multiple'`,
          [id_leccion]
        );
        const existentes = Number(retosActuales.rows[0]?.total ?? 0);

        await client.query(
          `DELETE FROM reto
           WHERE id_reto IN (
             SELECT id_reto FROM reto
             WHERE id_leccion = $1 AND tipo_reto = 'opcion_multiple'
             ORDER BY id_reto OFFSET 3
           )`,
          [id_leccion]
        );

        for (let indice = Math.min(existentes, 3); indice < 3; indice++) {
          const pregunta = preguntas[indice];
          const reto = await client.query<{ id_reto: number }>(
            `INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
             VALUES ($1, $2, $3, 'opcion_multiple', 0, $4)
             RETURNING id_reto`,
            [
              id_leccion,
              `Cuestionario ${indice + 1}: ${titulo}`,
              pregunta.pregunta,
              indice === 4 ? 'dificil' : indice >= 2 ? 'medio' : 'facil'
            ]
          );
          const idReto = reto.rows[0].id_reto;
        }

        const quizRetos = await client.query<{ id_reto: number }>(
          `SELECT id_reto FROM reto
           WHERE id_leccion = $1 AND tipo_reto = 'opcion_multiple'
           ORDER BY id_reto LIMIT 3`,
          [id_leccion]
        );
        for (const [indice, quizReto] of quizRetos.rows.entries()) {
          const pregunta = preguntas[indice];
          const opciones = [pregunta.correcta, pregunta.incorrecta1, pregunta.incorrecta2];
          const posicionCorrecta = (indice + 1) % 3;
          const correcta = opciones.splice(0, 1)[0];
          opciones.splice(posicionCorrecta, 0, correcta);

          await client.query('DELETE FROM respuesta WHERE id_reto = $1', [quizReto.id_reto]);
          await client.query(
            `INSERT INTO respuesta (id_reto, contenido, es_correcta)
             VALUES ($1, $2, $5), ($1, $3, $6), ($1, $4, $7)`,
            [
              quizReto.id_reto,
              opciones[0], opciones[1], opciones[2],
              posicionCorrecta === 0, posicionCorrecta === 1, posicionCorrecta === 2
            ]
          );
        }
      }
    }

    // Distribuye el XP de cada misión entre sus tres preguntas.
    await client.query(`
      WITH preguntas AS (
        SELECT r.id_reto,
               n.xp_requerida,
               ROW_NUMBER() OVER (PARTITION BY l.id_leccion ORDER BY r.id_reto) AS orden
        FROM reto r
        JOIN leccion l ON l.id_leccion = r.id_leccion
        JOIN nivel n ON n.id_nivel = l.id_nivel
        WHERE r.tipo_reto = 'opcion_multiple'
      )
      UPDATE reto r
      SET xp_recompensa = CASE
        WHEN preguntas.orden = 1 THEN preguntas.xp_requerida - (2 * FLOOR(preguntas.xp_requerida / 3.0))::INTEGER
        ELSE FLOOR(preguntas.xp_requerida / 3.0)::INTEGER
      END
      FROM preguntas
      WHERE r.id_reto = preguntas.id_reto
    `);

    await client.query('COMMIT');
    console.log('✅ Migración y sembrado de la base de datos completado exitosamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error crítico en la ejecución del sembrado:', error);
  } finally {
    client.release();
  }
}

runSeed().then(() => process.exit(0)).catch(() => process.exit(1));
