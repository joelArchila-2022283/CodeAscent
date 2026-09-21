-- PostgreSQL
-- Crea primero la base de datos (desde postgres o pgAdmin):
-- CREATE DATABASE "DBcodeAscent_in5cm";
-- Luego conéctate a esa base de datos y ejecuta este archivo.

-- ==========================================
-- 1. USUARIO
-- ==========================================
CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'jugador',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rol CHECK (rol IN ('jugador', 'admin'))
);

-- ==========================================
-- 2. LENGUAJE
-- ==========================================
CREATE TABLE lenguaje (
    id_lenguaje INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- 3. NIVEL
-- ==========================================
CREATE TABLE nivel (
    id_nivel INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_lenguaje INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    numero_nivel INTEGER NOT NULL,
    descripcion TEXT,
    xp_requerida INTEGER DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_nivel_lenguaje FOREIGN KEY (id_lenguaje)
        REFERENCES lenguaje(id_lenguaje),
    CONSTRAINT uq_nivel_lenguaje UNIQUE (id_lenguaje, numero_nivel)
);

-- ==========================================
-- 4. LECCION
-- ==========================================
CREATE TABLE leccion (
    id_leccion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_nivel INTEGER NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    manual_tecnico TEXT, -- Extensión para teoría profunda
    orden INTEGER NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_leccion_nivel FOREIGN KEY (id_nivel)
        REFERENCES nivel(id_nivel) ON DELETE CASCADE
);

-- ==========================================
-- 5. EJEMPLO
-- ==========================================
CREATE TABLE ejemplo (
    id_ejemplo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_leccion INTEGER NOT NULL,
    titulo VARCHAR(150),
    codigo TEXT NOT NULL,
    explicacion TEXT,
    CONSTRAINT fk_ejemplo_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion) ON DELETE CASCADE
);

-- ==========================================
-- 6. RETO
-- ==========================================
CREATE TABLE reto (
    id_reto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_leccion INTEGER NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    contexto_abp TEXT,   -- Planteamiento del Problema ABP
    esquema_bd TEXT,     -- Definición de tablas implicadas
    pistas JSONB,        -- Sistema de pistas progresivas
    tipo_reto VARCHAR(30) NOT NULL,
    xp_recompensa INTEGER NOT NULL DEFAULT 10,
    dificultad VARCHAR(20) DEFAULT 'facil',
    estado BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_reto_leccion FOREIGN KEY (id_leccion)
        REFERENCES leccion(id_leccion) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_reto CHECK (
        tipo_reto IN ('opcion_multiple', 'codigo', 'verdadero_falso', 'completar')
    ),
    CONSTRAINT chk_dificultad CHECK (
        dificultad IN ('facil', 'medio', 'dificil')
    )
);

-- ==========================================
-- 7. RESPUESTA
-- ==========================================
CREATE TABLE respuesta (
    id_respuesta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_reto INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    es_correcta BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_respuesta_reto FOREIGN KEY (id_reto)
        REFERENCES reto(id_reto) ON DELETE CASCADE
);

-- ==========================================
-- 8. INTENTO
-- ==========================================
CREATE TABLE intento (
    id_intento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_reto INTEGER NOT NULL,
    respuesta_usuario TEXT,
    correcto BOOLEAN NOT NULL,
    xp_obtenida INTEGER DEFAULT 0,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_intento_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_intento_reto FOREIGN KEY (id_reto)
        REFERENCES reto(id_reto) ON DELETE CASCADE
);

-- ==========================================
-- 9. PROGRESO
-- ==========================================
CREATE TABLE progreso (
    id_progreso INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_lenguaje INTEGER NOT NULL,
    id_nivel_actual INTEGER,
    xp_actual INTEGER DEFAULT 0,
    porcentaje DOUBLE PRECISION DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progreso_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_progreso_lenguaje FOREIGN KEY (id_lenguaje)
        REFERENCES lenguaje(id_lenguaje),
    CONSTRAINT fk_progreso_nivel FOREIGN KEY (id_nivel_actual)
        REFERENCES nivel(id_nivel),
    CONSTRAINT uq_progreso_usuario_lenguaje UNIQUE (id_usuario, id_lenguaje),
    CONSTRAINT chk_porcentaje CHECK (porcentaje >= 0 AND porcentaje <= 100)
);

-- ==========================================
-- 10. NIVEL USUARIO
-- ==========================================
CREATE TABLE nivel_usuario (
    id_nivel_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_nivel INTEGER NOT NULL,
    desbloqueado BOOLEAN DEFAULT FALSE,
    completado BOOLEAN DEFAULT FALSE,
    fecha_desbloqueo TIMESTAMP NULL,
    fecha_completado TIMESTAMP NULL,
    CONSTRAINT fk_nivel_usuario_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_nivel_usuario_nivel FOREIGN KEY (id_nivel)
        REFERENCES nivel(id_nivel) ON DELETE CASCADE,
    CONSTRAINT uq_usuario_nivel UNIQUE (id_usuario, id_nivel)
);

-- ==========================================
-- 11. LOGRO
-- ==========================================
CREATE TABLE logro (
    id_logro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    xp_recompensa INTEGER DEFAULT 0,
    requisito TEXT,
    estado BOOLEAN DEFAULT TRUE
);

-- ==========================================
-- 12. USUARIO LOGRO
-- ==========================================
CREATE TABLE usuario_logro (
    id_usuario_logro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_logro INTEGER NOT NULL,
    fecha_obtenido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_logro_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_logro_logro FOREIGN KEY (id_logro)
        REFERENCES logro(id_logro) ON DELETE CASCADE,
    CONSTRAINT uq_usuario_logro UNIQUE (id_usuario, id_logro)
);

-- ============================================================
-- CRUD COMPLETO CON PROCEDIMIENTOS Y FUNCIONES 
-- (Create, Read/Show, Update, Delete)
-- ============================================================

-- ==========================================
-- 1. USUARIO
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_usuario(
    p_nombre VARCHAR,
    p_correo VARCHAR,
    p_password VARCHAR,
    p_rol VARCHAR DEFAULT 'jugador'
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO usuario (nombre, correo, password, rol)
    VALUES (p_nombre, p_correo, p_password, p_rol);
END;
$$;

-- READ (Mostrar Todos)
CREATE OR REPLACE FUNCTION fn_obtener_usuarios()
RETURNS SETOF usuario LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuario;
END;
$$;

-- READ (Mostrar por ID)
CREATE OR REPLACE FUNCTION fn_obtener_usuario_por_id(p_id INTEGER)
RETURNS SETOF usuario LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuario WHERE id_usuario = p_id;
END;
$$;

-- READ (Buscar usuario por Correo para el Login)
CREATE OR REPLACE FUNCTION fn_obtener_usuario_por_correo(p_correo VARCHAR)
RETURNS SETOF usuario LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuario WHERE correo = p_correo;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_usuario(
    p_id_usuario INTEGER,
    p_nombre VARCHAR,
    p_correo VARCHAR,
    p_password VARCHAR,
    p_rol VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE usuario
    SET nombre = p_nombre,
        correo = p_correo,
        password = p_password,
        rol = p_rol
    WHERE id_usuario = p_id_usuario;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_usuario(p_id_usuario INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM usuario WHERE id_usuario = p_id_usuario;
END;
$$;


-- ==========================================
-- 2. LENGUAJE 
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_lenguaje(
    p_nombre VARCHAR,
    p_descripcion TEXT,
    p_estado BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO lenguaje (nombre, descripcion, estado)
    VALUES (p_nombre, p_descripcion, p_estado);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_lenguajes()
RETURNS SETOF lenguaje LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM lenguaje;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_lenguaje_por_id(p_id INTEGER)
RETURNS SETOF lenguaje LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM lenguaje WHERE id_lenguaje = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_lenguaje(
    p_id_lenguaje INTEGER,
    p_nombre VARCHAR,
    p_descripcion TEXT,
    p_estado BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE lenguaje
    SET nombre = p_nombre,
        descripcion = p_descripcion,
        estado = p_estado
    WHERE id_lenguaje = p_id_lenguaje;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_lenguaje(p_id_lenguaje INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM lenguaje WHERE id_lenguaje = p_id_lenguaje;
END;
$$;


-- ==========================================
-- 3. NIVEL
-- ==========================================

-- CREATE (Busca el lenguaje por su nombre)
CREATE OR REPLACE PROCEDURE sp_crear_nivel(
    p_nombre_lenguaje VARCHAR,
    p_nombre_nivel VARCHAR,
    p_numero_nivel INTEGER,
    p_descripcion TEXT,
    p_xp_requerida INTEGER DEFAULT 0
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id_lenguaje INTEGER;
BEGIN
    SELECT id_lenguaje INTO v_id_lenguaje
    FROM lenguaje WHERE LOWER(nombre) = LOWER(p_nombre_lenguaje);

    IF v_id_lenguaje IS NULL THEN
        RAISE EXCEPTION 'Lenguaje "%" no encontrado.', p_nombre_lenguaje;
    END IF;

    INSERT INTO nivel (id_lenguaje, nombre, numero_nivel, descripcion, xp_requerida)
    VALUES (v_id_lenguaje, p_nombre_nivel, p_numero_nivel, p_descripcion, p_xp_requerida);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_niveles()
RETURNS SETOF nivel LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM nivel ORDER BY id_lenguaje, numero_nivel;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_nivel_por_id(p_id INTEGER)
RETURNS SETOF nivel LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM nivel WHERE id_nivel = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_nivel(
    p_id_nivel INTEGER,
    p_nombre VARCHAR,
    p_numero_nivel INTEGER,
    p_descripcion TEXT,
    p_xp_requerida INTEGER,
    p_estado BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE nivel
    SET nombre = p_nombre,
        numero_nivel = p_numero_nivel,
        descripcion = p_descripcion,
        xp_requerida = p_xp_requerida,
        estado = p_estado
    WHERE id_nivel = p_id_nivel;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_nivel(p_id_nivel INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM nivel WHERE id_nivel = p_id_nivel;
END;
$$;


-- ==========================================
-- 4. LECCION 
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_leccion(
    p_id_nivel INTEGER,
    p_titulo VARCHAR,
    p_contenido TEXT,
    p_orden INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO leccion (id_nivel, titulo, contenido, orden)
    VALUES (p_id_nivel, p_titulo, p_contenido, p_orden);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_lecciones()
RETURNS SETOF leccion LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM leccion ORDER BY id_nivel, orden;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_leccion_por_id(p_id INTEGER)
RETURNS SETOF leccion LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM leccion WHERE id_leccion = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_leccion(
    p_id_leccion INTEGER,
    p_titulo VARCHAR,
    p_contenido TEXT,
    p_orden INTEGER,
    p_estado BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE leccion
    SET titulo = p_titulo,
        contenido = p_contenido,
        orden = p_orden,
        estado = p_estado
    WHERE id_leccion = p_id_leccion;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_leccion(p_id_leccion INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM leccion WHERE id_leccion = p_id_leccion;
END;
$$;


-- ==========================================
-- 5. EJEMPLO
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_ejemplo(
    p_id_leccion INTEGER,
    p_titulo VARCHAR,
    p_codigo TEXT,
    p_explicacion TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ejemplo (id_leccion, titulo, codigo, explicacion)
    VALUES (p_id_leccion, p_titulo, p_codigo, p_explicacion);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_ejemplos()
RETURNS SETOF ejemplo LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM ejemplo;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_ejemplo_por_id(p_id INTEGER)
RETURNS SETOF ejemplo LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM ejemplo WHERE id_ejemplo = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_ejemplo(
    p_id_ejemplo INTEGER,
    p_titulo VARCHAR,
    p_codigo TEXT,
    p_explicacion TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ejemplo
    SET titulo = p_titulo,
        codigo = p_codigo,
        explicacion = p_explicacion
    WHERE id_ejemplo = p_id_ejemplo;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_ejemplo(p_id_ejemplo INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ejemplo WHERE id_ejemplo = p_id_ejemplo;
END;
$$;


-- ==========================================
-- 6. RETO
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_reto(
    p_id_leccion INTEGER,
    p_titulo VARCHAR,
    p_descripcion TEXT,
    p_tipo_reto VARCHAR,
    p_xp_recompensa INTEGER DEFAULT 10,
    p_dificultad VARCHAR DEFAULT 'facil'
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
    VALUES (p_id_leccion, p_titulo, p_descripcion, p_tipo_reto, p_xp_recompensa, p_dificultad);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_retos()
RETURNS SETOF reto LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM reto;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_reto_por_id(p_id INTEGER)
RETURNS SETOF reto LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM reto WHERE id_reto = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_reto(
    p_id_reto INTEGER,
    p_titulo VARCHAR,
    p_descripcion TEXT,
    p_tipo_reto VARCHAR,
    p_xp_recompensa INTEGER,
    p_dificultad VARCHAR,
    p_estado BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE reto
    SET titulo = p_titulo,
        descripcion = p_descripcion,
        tipo_reto = p_tipo_reto,
        xp_recompensa = p_xp_recompensa,
        dificultad = p_dificultad,
        estado = p_estado
    WHERE id_reto = p_id_reto;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_reto(p_id_reto INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM reto WHERE id_reto = p_id_reto;
END;
$$;


-- ==========================================
-- 7. RESPUESTA
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_respuesta(
    p_id_reto INTEGER,
    p_contenido TEXT,
    p_es_correcta BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO respuesta (id_reto, contenido, es_correcta)
    VALUES (p_id_reto, p_contenido, p_es_correcta);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_respuestas()
RETURNS SETOF respuesta LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM respuesta;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_respuesta_por_id(p_id INTEGER)
RETURNS SETOF respuesta LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM respuesta WHERE id_respuesta = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_respuesta(
    p_id_respuesta INTEGER,
    p_contenido TEXT,
    p_es_correcta BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE respuesta
    SET contenido = p_contenido,
        es_correcta = p_es_correcta
    WHERE id_respuesta = p_id_respuesta;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_respuesta(p_id_respuesta INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM respuesta WHERE id_respuesta = p_id_respuesta;
END;
$$;


-- ==========================================
-- 8. INTENTO
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_intento(
    p_id_usuario INTEGER,
    p_id_reto INTEGER,
    p_respuesta_usuario TEXT,
    p_correcto BOOLEAN,
    p_xp_obtenida INTEGER DEFAULT 0
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_xp_reto INTEGER := 0;
    v_xp_final INTEGER := 0;
    v_id_lenguaje INTEGER;
    v_ya_completado BOOLEAN := FALSE;
BEGIN

    SELECT
        COALESCE(r.xp_recompensa, 0),
        n.id_lenguaje

    INTO
        v_xp_reto,
        v_id_lenguaje

    FROM reto r

    INNER JOIN leccion l
        ON l.id_leccion = r.id_leccion

    INNER JOIN nivel n
        ON n.id_nivel = l.id_nivel

    WHERE r.id_reto = p_id_reto;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'El reto % no existe.',
            p_id_reto;

    END IF;


    SELECT EXISTS (

        SELECT 1

        FROM intento

        WHERE id_usuario = p_id_usuario

          AND id_reto = p_id_reto

          AND correcto = TRUE

    )

    INTO v_ya_completado;


    IF
        p_correcto = TRUE
        AND v_ya_completado = FALSE
    THEN

        v_xp_final :=
            v_xp_reto;

    ELSE

        v_xp_final :=
            0;

    END IF;


    INSERT INTO intento (

        id_usuario,
        id_reto,
        respuesta_usuario,
        correcto,
        xp_obtenida

    )

    VALUES (

        p_id_usuario,
        p_id_reto,
        p_respuesta_usuario,
        p_correcto,
        v_xp_final

    );


    IF v_xp_final > 0 THEN

        UPDATE progreso

        SET

            xp_actual =
                COALESCE(
                    xp_actual,
                    0
                ) + v_xp_final,

            fecha_actualizacion =
                CURRENT_TIMESTAMP

        WHERE id_usuario =
            p_id_usuario

          AND id_lenguaje =
            v_id_lenguaje;

    END IF;

END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_intentos()
RETURNS SETOF intento LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM intento;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_intento_por_id(p_id INTEGER)
RETURNS SETOF intento LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM intento WHERE id_intento = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_intento(
    p_id_intento INTEGER,
    p_respuesta_usuario TEXT,
    p_correcto BOOLEAN,
    p_xp_obtenida INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE intento
    SET respuesta_usuario = p_respuesta_usuario,
        correcto = p_correcto,
        xp_obtenida = p_xp_obtenida
    WHERE id_intento = p_id_intento;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_intento(p_id_intento INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM intento WHERE id_intento = p_id_intento;
END;
$$;


-- ==========================================
-- 9. PROGRESO
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_progreso(
    p_id_usuario INTEGER,
    p_id_lenguaje INTEGER,
    p_id_nivel_actual INTEGER DEFAULT NULL,
    p_xp_actual INTEGER DEFAULT 0,
    p_porcentaje DOUBLE PRECISION DEFAULT 0
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO progreso (id_usuario, id_lenguaje, id_nivel_actual, xp_actual, porcentaje)
    VALUES (p_id_usuario, p_id_lenguaje, p_id_nivel_actual, p_xp_actual, p_porcentaje);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_progresos()
RETURNS SETOF progreso LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM progreso;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_progreso_por_id(p_id INTEGER)
RETURNS SETOF progreso LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM progreso WHERE id_progreso = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_progreso(
    p_id_progreso INTEGER,
    p_id_nivel_actual INTEGER,
    p_xp_actual INTEGER,
    p_porcentaje DOUBLE PRECISION
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE progreso
    SET id_nivel_actual = p_id_nivel_actual,
        xp_actual = p_xp_actual,
        porcentaje = p_porcentaje,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id_progreso = p_id_progreso;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_progreso(p_id_progreso INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM progreso WHERE id_progreso = p_id_progreso;
END;
$$;


-- ==========================================
-- 10. NIVEL USUARIO
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_nivel_usuario(
    p_id_usuario INTEGER,
    p_id_nivel INTEGER,
    p_desbloqueado BOOLEAN DEFAULT FALSE,
    p_completado BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO nivel_usuario (
        id_usuario, id_nivel, desbloqueado, completado,
        fecha_desbloqueo, fecha_completado
    )
    VALUES (
        p_id_usuario, p_id_nivel, p_desbloqueado, p_completado,
        CASE WHEN p_desbloqueado THEN CURRENT_TIMESTAMP ELSE NULL END,
        CASE WHEN p_completado THEN CURRENT_TIMESTAMP ELSE NULL END
    );
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_niveles_usuario()
RETURNS SETOF nivel_usuario LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM nivel_usuario;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_nivel_usuario_por_id(p_id INTEGER)
RETURNS SETOF nivel_usuario LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM nivel_usuario WHERE id_nivel_usuario = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_nivel_usuario(
    p_id_nivel_usuario INTEGER,
    p_desbloqueado BOOLEAN,
    p_completado BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE nivel_usuario
    SET desbloqueado = p_desbloqueado,
        completado = p_completado,
        fecha_desbloqueo = CASE WHEN p_desbloqueado AND fecha_desbloqueo IS NULL THEN CURRENT_TIMESTAMP ELSE fecha_desbloqueo END,
        fecha_completado = CASE WHEN p_completado AND fecha_completado IS NULL THEN CURRENT_TIMESTAMP ELSE fecha_completado END
    WHERE id_nivel_usuario = p_id_nivel_usuario;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_nivel_usuario(p_id_nivel_usuario INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM nivel_usuario WHERE id_nivel_usuario = p_id_nivel_usuario;
END;
$$;


-- ==========================================
-- 11. LOGRO
-- ==========================================

-- CREATE (Corregido: p_requisito incluye DEFAULT NULL)
CREATE OR REPLACE PROCEDURE sp_crear_logro(
    p_nombre VARCHAR,
    p_descripcion TEXT,
    p_xp_recompensa INTEGER DEFAULT 0,
    p_requisito TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO logro (nombre, descripcion, xp_recompensa, requisito)
    VALUES (p_nombre, p_descripcion, p_xp_recompensa, p_requisito);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_logros()
RETURNS SETOF logro LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM logro;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_logro_por_id(p_id INTEGER)
RETURNS SETOF logro LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM logro WHERE id_logro = p_id;
END;
$$;

-- UPDATE
CREATE OR REPLACE PROCEDURE sp_actualizar_logro(
    p_id_logro INTEGER,
    p_nombre VARCHAR,
    p_descripcion TEXT,
    p_xp_recompensa INTEGER,
    p_requisito TEXT,
    p_estado BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE logro
    SET nombre = p_nombre,
        descripcion = p_descripcion,
        xp_recompensa = p_xp_recompensa,
        requisito = p_requisito,
        estado = p_estado
    WHERE id_logro = p_id_logro;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_logro(p_id_logro INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM logro WHERE id_logro = p_id_logro;
END;
$$;


-- ==========================================
-- 12. USUARIO LOGRO
-- ==========================================

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_usuario_logro(
    p_id_usuario INTEGER,
    p_id_logro INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO usuario_logro (id_usuario, id_logro)
    VALUES (p_id_usuario, p_id_logro);
END;
$$;

-- READ
CREATE OR REPLACE FUNCTION fn_obtener_usuario_logros()
RETURNS SETOF usuario_logro LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuario_logro;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_usuario_logro_por_id(p_id INTEGER)
RETURNS SETOF usuario_logro LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT * FROM usuario_logro WHERE id_usuario_logro = p_id;
END;
$$;

-- DELETE
CREATE OR REPLACE PROCEDURE sp_eliminar_usuario_logro(p_id_usuario_logro INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM usuario_logro WHERE id_usuario_logro = p_id_usuario_logro;
END;
$$;

-- ==========================================
-- LOGROS DEL MODULO SQL
-- ==========================================
INSERT INTO logro (nombre, descripcion, xp_recompensa, requisito, estado)
VALUES
    ('SQL: Primer Comando', 'Ejecuta correctamente tu primera misión SQL.', 25, 'Completar 1 misión SQL', TRUE),
    ('SQL: Operador de Datos', 'Domina cinco misiones del circuito SQL.', 75, 'Completar 5 misiones SQL', TRUE),
    ('SQL: Arquitecto del Valle', 'Completa las diez misiones SQL registradas.', 150, 'Completar 10 misiones SQL', TRUE)
ON CONFLICT (nombre) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    xp_recompensa = EXCLUDED.xp_recompensa,
    requisito = EXCLUDED.requisito,
    estado = TRUE;

-- ------------------------------------------------------------
-- INSERCIÓN DE DATOS
-- ------------------------------------------------------------

-- Lenguajes
CALL sp_crear_lenguaje('SQL', 'Lenguaje estándar para la gestión, consulta y manipulación de bases de datos relacionales.', TRUE);
CALL sp_crear_lenguaje('HTML', 'Lenguaje de marcado utilizado para estructurar el contenido de las páginas y aplicaciones web.', TRUE);
CALL sp_crear_lenguaje('CSS', 'Lenguaje de estilos para diseñar y personalizar la presentación visual de interfaces web.', TRUE);
CALL sp_crear_lenguaje('TypeScript', 'Superset tipado de JavaScript diseñado para construir aplicaciones web escalables y robustas.', TRUE);

-- Usuarios con contraseñas hash (bcryptjs)
-- Contraseña Admin: AdminPass123!
CALL sp_crear_usuario('Administrador','admin@codeascent.com','$2b$10$Y.xseToumZS6PWjDRxsa9eeFNxCQMKEY7joioMVdkYxiBn3eIOtzq','admin');

-- Contraseña Jugador: PlayerPass123!
CALL sp_crear_usuario('Jugador Uno','jugador1@email.com','$2a$10$xU9L8gXK0kK4wHh1w6Z3f.pH8f3A8N4i9G0M1N2O3P4Q5R6S7T', 'jugador');

-- Logros
CALL sp_crear_logro('Primer Paso', 'Completa tu primer nivel en cualquier lenguaje.', 50, 'Completar 1 Nivel');
CALL sp_crear_logro('Maestro SQL', 'Completa los 10 niveles de SQL.', 500, 'Completar Nivel 10 de SQL');
CALL sp_crear_logro('Desarrollador Frontend', 'Completa los niveles de HTML y CSS.', 1000, 'Completar HTML y CSS');

-- Niveles: SQL (10 Niveles)
CALL sp_crear_nivel('SQL', 'Introducción a Bases de Datos', 1, 'Conceptos clave de modelos relacionales.', 50);
CALL sp_crear_nivel('SQL', 'Sentencia SELECT Básica', 2, 'Consultar filas y columnas específicas.', 100);
CALL sp_crear_nivel('SQL', 'Filtros con WHERE', 3, 'Uso de operadores lógicos y de comparación.', 150);
CALL sp_crear_nivel('SQL', 'Ordenamiento y Límites', 4, 'Aplicación de ORDER BY y LIMIT/OFFSET.', 200);
CALL sp_crear_nivel('SQL', 'Funciones de Agregación', 5, 'Uso de COUNT, SUM, AVG, MIN y MAX.', 250);
CALL sp_crear_nivel('SQL', 'Agrupamiento con GROUP BY', 6, 'Agrupar registros y filtrar con HAVING.', 300);
CALL sp_crear_nivel('SQL', 'Uniones con INNER JOIN', 7, 'Combinar información de múltiples tablas.', 350);
CALL sp_crear_nivel('SQL', 'Uniones Externas (LEFT / RIGHT JOIN)', 8, 'Manejo de registros no coincidentes.', 400);
CALL sp_crear_nivel('SQL', 'Subconsultas y CTEs', 9, 'Consultas anidadas y expresiones de tabla.', 450);
CALL sp_crear_nivel('SQL', 'Manipulación de Datos (DML)', 10, 'Uso avanzado de INSERT, UPDATE y DELETE.', 500);

-- Niveles: HTML (10 Niveles)
CALL sp_crear_nivel('HTML', 'Estructura Básica Documento', 1, 'Etiquetas doctype, html, head y body.', 50);
CALL sp_crear_nivel('HTML', 'Encabezados y Párrafos', 2, 'Jerarquía de texto con h1-h6 y p.', 100);
CALL sp_crear_nivel('HTML', 'Enlaces y Navegación', 3, 'Uso del elemento a y rutas relativas/absolutas.', 150);
CALL sp_crear_nivel('HTML', 'Imágenes y Multimedia', 4, 'Inserción de img, audio y video.', 200);
CALL sp_crear_nivel('HTML', 'Listas Ordenadas y Desordenadas', 5, 'Estructuración mediante ul, ol y li.', 250);
CALL sp_crear_nivel('HTML', 'Tablas de Datos', 6, 'Creación de tablas con table, tr, th y td.', 300);
CALL sp_crear_nivel('HTML', 'Formularios Básicos', 7, 'Uso de form, input, label y button.', 350);
CALL sp_crear_nivel('HTML', 'Tipos de Input Avanzados', 8, 'Validación nativa con email, number y date.', 400);
CALL sp_crear_nivel('HTML', 'HTML Semántico', 9, 'Uso de header, nav, main, section y footer.', 450);
CALL sp_crear_nivel('HTML', 'Atributos Globales y Accesibilidad', 10, 'Atributos ARIA, id, class y lang.', 500);

-- Niveles: CSS (10 Niveles)
CALL sp_crear_nivel('CSS', 'Sintaxis y Selectores Básicos', 1, 'Selectores de elemento, clase e ID.', 50);
CALL sp_crear_nivel('CSS', 'Modelo de Caja (Box Model)', 2, 'Manejo de margin, border, padding y content.', 100);
CALL sp_crear_nivel('CSS', 'Colores y Fondos', 3, 'Uso de HEX, RGB, HSL y propiedades de background.', 150);
CALL sp_crear_nivel('CSS', 'Tipografía y Fuentes', 4, 'Propiedades font-family, size, weight y line-height.', 200);
CALL sp_crear_nivel('CSS', 'Posicionamiento', 5, 'Estrategias static, relative, absolute y fixed.', 250);
CALL sp_crear_nivel('CSS', 'Flexbox Contenedor', 6, 'Alineación con display flex y justify-content.', 300);
CALL sp_crear_nivel('CSS', 'Flexbox Elementos', 7, 'Uso de flex-grow, flex-shrink y align-self.', 350);
CALL sp_crear_nivel('CSS', 'CSS Grid Layout', 8, 'Definición de filas y columnas con grid-template.', 400);
CALL sp_crear_nivel('CSS', 'Diseño Responsivo', 9, 'Uso de Media Queries y unidades relativas (rem/em).', 450);
CALL sp_crear_nivel('CSS', 'Transiciones y Animaciones', 10, 'Efectos con transition, transform y keyframes.', 500);

-- Niveles: TypeScript (10 Niveles)
CALL sp_crear_nivel('TypeScript', 'Tipos Primitivos', 1, 'Declaración explicita con string, number y boolean.', 50);
CALL sp_crear_nivel('TypeScript', 'Inferencia de Tipos', 2, 'Comprensión del tipado implícito en TS.', 100);
CALL sp_crear_nivel('TypeScript', 'Arreglos y Tuplas', 3, 'Definición de arrays tipados y tuplas fijas.', 150);
CALL sp_crear_nivel('TypeScript', 'Interfaces Básicas', 4, 'Definición de contratos de estructura de objetos.', 200);
CALL sp_crear_nivel('TypeScript', 'Type Aliases', 5, 'Creación de tipos personalizados y de unión.', 250);
CALL sp_crear_nivel('TypeScript', 'Tipado de Funciones', 6, 'Parámetros opcionales, por defecto y retorno.', 300);
CALL sp_crear_nivel('TypeScript', 'Enums y Literales', 7, 'Uso de enumeraciones numéricas y de cadena.', 350);
CALL sp_crear_nivel('TypeScript', 'Clases y Modificadores', 8, 'Uso de public, private, protected y readonly.', 400);
CALL sp_crear_nivel('TypeScript', 'Genéricos Básicos', 9, 'Creación de componentes y funciones reutilizables.', 450);
CALL sp_crear_nivel('TypeScript', 'Narrowing y Type Guards', 10, 'Verificación estricta de tipos en tiempo de ejecución.', 500);

-- Lecciones (5 Registros)
CALL sp_crear_leccion(1, '¿Qué es una Base de Datos Relacional?', 'Una base de datos relacional organiza la información en tablas...', 1);
CALL sp_crear_leccion(2, 'Sintaxis de la Consulta SELECT', 'La instrucción SELECT recupera filas y columnas específicas...', 1);
CALL sp_crear_leccion(11, 'Estructura Fundamental de HTML5', 'Un archivo HTML5 contiene el DOCTYPE, html, head y body...', 1);
CALL sp_crear_leccion(21, 'Reglas de Estilo y Selectores CSS', 'CSS aplica reglas compuestas por un selector y bloque de declaraciones...', 1);
CALL sp_crear_leccion(31, 'Declaración de Tipos Primitivos en TS', 'TypeScript permite asociar tipos explicitos a las variables...', 1);

-- Ejemplos (5 Registros)
CALL sp_crear_ejemplo(1, 'Consulta SELECT Simple', 'SELECT * FROM usuario;', 'Muestra todas las filas y columnas registradas en la tabla usuario.');
CALL sp_crear_ejemplo(2, 'Filtrar con WHERE', 'SELECT nombre, correo FROM usuario WHERE rol = ''jugador'';', 'Filtra y devuelve unicamente a los usuarios con el rol de jugador.');
CALL sp_crear_ejemplo(3, 'Plantilla Básica HTML', '<!DOCTYPE html>' || chr(10) || '<html>' || chr(10) || '<head><title>Mi Pagina</title></head>' || chr(10) || '<body><h1>Hola Mundo</h1></body>' || chr(10) || '</html>', 'Estructura minima obligatoria para un documento HTML5 estándar.');
CALL sp_crear_ejemplo(4, 'Regla CSS para Títulos', 'h1 {' || chr(10) || '  color: #3498db;' || chr(10) || '  text-align: center;' || chr(10) || '}', 'Establece color azul y alineacion centrada para todas las etiquetas H1.');
CALL sp_crear_ejemplo(5, 'Tipado de Variables TS', 'const nombreUsuario: string = "Carlos";' || chr(10) || 'const nivelActual: number = 5;' || chr(10) || 'const estaActivo: boolean = true;', 'Ejemplo de asignación explicita para string, number y boolean en TypeScript.');

-- ============================================================
-- CODEASCENT - CONTENIDO HTML
-- 10 MISIONES / 10 LECCIONES / 10 CUESTIONARIOS
-- ============================================================

DO $$
DECLARE
    v_id_lenguaje INTEGER;
    v_id_nivel INTEGER;
    v_id_leccion INTEGER;
    v_id_reto INTEGER;
BEGIN

    -- 1. Obtener ID del lenguaje HTML
    SELECT id_lenguaje INTO v_id_lenguaje
    FROM lenguaje WHERE LOWER(nombre) = 'html';

    IF v_id_lenguaje IS NULL THEN
        RAISE EXCEPTION 'El lenguaje HTML no existe en la base de datos.';
    END IF;

    -- ========================================================
    -- MISIÓN 1: Estructura Básica
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 1;

    IF v_id_nivel IS NOT NULL THEN
                SELECT id_leccion INTO v_id_leccion
                FROM leccion
                WHERE id_nivel = v_id_nivel
                    AND titulo = 'Estructura Fundamental de HTML5'
                ORDER BY id_leccion DESC
                LIMIT 1;

                IF v_id_leccion IS NULL THEN
                        CALL sp_crear_leccion(v_id_nivel, 'Estructura Fundamental de HTML5', 'HTML es el esqueleto de la web. Un archivo HTML5 requiere la etiqueta <!DOCTYPE html> para definir el estándar, la etiqueta <html> como raíz, el <head> para el cerebro invisible (metadatos) y el <body> para el contenido visual principal.', 1);
                        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Estructura Fundamental de HTML5' ORDER BY id_leccion DESC LIMIT 1;
                END IF;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Ubicación del contenido', 'Si escribes el texto "Hola Mundo" exactamente entre la etiqueta </head> y la etiqueta <body>, ¿qué hará el navegador web?', 'opcion_multiple', 50, 'facil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'Mostrará "Hola Mundo" correctamente, pero es una mala práctica porque rompe la semántica del documento.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'La pantalla se quedará en blanco por un error crítico.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'El texto se ocultará automáticamente en la pestaña del navegador.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 2: Jerarquía de Texto
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 2;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Jerarquía de Texto y Títulos', 'El texto necesita jerarquía para el SEO y la accesibilidad. Usamos <h1> para el titular principal, 2 a 6 para subtítulos, y <p> para párrafos. Son elementos de bloque, por lo que siempre ocupan todo el ancho disponible y fuerzan un salto de línea.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Comportamiento de bloques', 'Si escribes <h1>Hola</h1><h2>Mundo</h2> en una sola línea de tu código, ¿cómo se mostrará en el navegador?', 'opcion_multiple', 100, 'facil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, '"Hola" en una línea enorme y "Mundo" en la línea de abajo, ligeramente más pequeño.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, '"Hola Mundo" en la misma línea, con "Mundo" más pequeño.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Causará un error de renderizado visual.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 3: Hipervínculos
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 3;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Hipervínculos y Atributos', 'La etiqueta de ancla <a> transforma un texto estático en un puente hacia otra URL. Es un elemento en línea y requiere obligatoriamente el atributo "href" para funcionar y saber a qué destino web debe dirigir al usuario al hacer clic.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Atributos obligatorios', 'Si escribes <a>Ir a Google</a> sin declarar el atributo href, ¿qué sucede en la pantalla?', 'opcion_multiple', 150, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'Se ve y se comporta como texto normal, sin formato azul ni subrayado, y no es cliqueable.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'Funciona como un enlace, pero recarga la misma página actual.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Da un error de compilación de HTML en la consola.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 4: Imágenes y Multimedia
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 4;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Imágenes y Accesibilidad', 'La etiqueta <img> es de autocierre. Usa el atributo "src" para indicar la ruta de la imagen y el atributo "alt" para describir la imagen a los lectores de pantalla (accesibilidad) y a los motores de búsqueda.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Accesibilidad de Imágenes', 'Si cometes un error tipográfico en la ruta del atributo src de una imagen, ¿qué leerá un usuario ciego que navega con un lector de pantalla?', 'opcion_multiple', 200, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'El lector dictará exactamente lo que esté escrito en el atributo alt.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'El lector dictará la palabra "Error 404".', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'El lector se saltará la imagen en completo silencio.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 5: Listas Estructuradas
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 5;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Listas Estructuradas', 'Usa <ol> para listas ordenadas (1, 2, 3) y <ul> para listas desordenadas (viñetas de puntos). Ambas listas requieren que cada elemento en su interior esté envuelto obligatoriamente en la etiqueta de hijo <li> (List Item).', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Anidación estricta', 'Si escribes el texto suelto "Manzanas" directamente dentro de un <ul>, pero sin envolverlo en un <li>, ¿es esto un HTML válido?', 'opcion_multiple', 250, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'No, es una violación de la estructura estándar HTML.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'Sí, generará un punto de viñeta automáticamente al renderizar.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Sí, pero se verá como texto fuera de la lista.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 6: Tablas de Datos
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 6;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Tablas de Datos Bidimensionales', 'Las tablas estructuran datos como en una hoja de cálculo. Se declaran envolviendo todo en <table>. Dentro de ella, las filas horizontales se crean con <tr>. Dentro de cada fila, los encabezados se definen con <th> y las celdas normales de datos con <td>.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Dibujo de cuadrícula', 'Si escribes tres etiquetas <td> seguidas de tres etiquetas <tr>, ¿cómo se mostrará la cuadrícula?', 'opcion_multiple', 300, 'dificil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'Generará un error semántico porque las celdas (td) deben vivir obligatoriamente dentro de una fila (tr).', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'Se dibujará una tabla de 3x3 celdas.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Dibujará todo en una sola línea horizontal desordenada.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 7: Formularios Básicos
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 7;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Formularios y Elementos Interactivos', 'Un <form> agrupa campos interactivos para recolectar datos del usuario. La etiqueta <input> es de autocierre y cambia drásticamente según su atributo type (text, password, email, checkbox). Finalmente, usamos <button> para la acción de envío.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Modificadores de Input', 'Si escribes <input type="password"> en lugar de type="text", ¿qué cambiará visualmente en la pantalla del usuario?', 'opcion_multiple', 350, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'Los caracteres tipeados se enmascararán con puntos o asteriscos ocultando el valor.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'El campo se pintará de color rojo indicando alta seguridad.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'El navegador forzará un teclado numérico de seguridad especial.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 8: Contenedores Genéricos
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 8;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Tipos de Input Avanzados', 'Los controles de formulario comunican la intención del dato. email valida una dirección, number representa cantidades y date permite seleccionar una fecha con controles nativos del navegador.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Tipos de Input', 'Si utilizas input type="email" en lugar de type="text", ¿qué comportamiento adicional aporta el navegador?', 'opcion_multiple', 400, 'dificil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'El navegador puede validar el formato de correo antes del envío.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'El navegador convierte el campo automáticamente en una contraseña.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'El navegador crea una tabla con los datos ingresados.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 9: Semántica Web Modernizada
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 9;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Etiquetas Semánticas', 'HTML5 introdujo etiquetas como <header>, <main> y <footer> para reemplazar el exceso de <div> genéricos. Tienen el mismo comportamiento visual que un div, pero le explican el propósito de esa zona a los motores de búsqueda (SEO) y a los lectores de pantalla.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Jerarquía SEO', '¿Es una buena práctica colocar múltiples etiquetas <main> visibles en una sola página HTML?', 'opcion_multiple', 450, 'dificil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'No, el estándar dictamina que solo debe existir un elemento <main> visible por documento para no confundir a los buscadores.', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'Sí, cuantas más áreas principales tenga la web, mejor será su posicionamiento SEO.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Sí, pero solo si están incrustadas una dentro de la otra recursivamente.', FALSE);
    END IF;

    -- ========================================================
    -- MISIÓN 10: Atributos Globales
    -- ========================================================
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 10;

    IF v_id_nivel IS NOT NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Identificadores y Clases', 'Los atributos globales sirven para manipular elementos con CSS o JS. El atributo "id" funciona como un número de pasaporte: es un identificador único e irrepetible. El atributo "class" funciona como un uniforme: se usa para agrupar múltiples elementos diferentes bajo un mismo estilo.', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion DESC LIMIT 1;

        CALL sp_crear_reto(v_id_leccion, 'Predicción: Regla de Unicidad', 'Si asignas id="boton-rojo" a tres botones diferentes en la misma página HTML, ¿qué dice el estándar sobre esta práctica?', 'opcion_multiple', 500, 'dificil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion ORDER BY id_reto DESC LIMIT 1;

        CALL sp_crear_respuesta(v_id_reto, 'Es un error grave de validación, el ID debe ser strictly único por página. Deberías usar una clase (class).', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'Es correcto si los tres botones son físicamente iguales en tamaño.', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Causará que el navegador elimine completamente los botones del renderizado visual.', FALSE);
    END IF;

    RAISE NOTICE 'Los 10 cuestionarios y lecciones de HTML fueron creados correctamente.';

END $$;

-- ============================================================
-- HTML - MANUAL TECNICO Y PROBLEMAS ABP
-- Opcion A: contenido enriquecido en leccion.contenido.
-- ============================================================

UPDATE leccion
SET titulo = 'Tipos de Input Avanzados'
WHERE titulo = 'Contenedores: div y span'
    AND id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 8);

UPDATE reto
SET titulo = 'Predicción: Tipos de Input',
        descripcion = 'Si utilizas input type="email" en lugar de type="text", ¿qué comportamiento adicional aporta el navegador?'
WHERE titulo = 'Predicción: Bloque vs Línea'
    AND id_leccion = (SELECT le.id_leccion FROM leccion le JOIN nivel n ON n.id_nivel = le.id_nivel JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 8);

UPDATE respuesta
SET contenido = CASE
        WHEN es_correcta THEN 'El navegador puede validar el formato de correo antes del envío.'
        WHEN id_respuesta = (SELECT MIN(r2.id_respuesta) FROM respuesta r2 JOIN reto rt2 ON rt2.id_reto = r2.id_reto WHERE rt2.titulo = 'Predicción: Tipos de Input') THEN 'El navegador convierte el campo automáticamente en una contraseña.'
        ELSE 'El navegador crea una tabla con los datos ingresados.'
END
WHERE id_reto = (SELECT rt.id_reto FROM reto rt WHERE rt.titulo = 'Predicción: Tipos de Input' AND rt.id_leccion = (SELECT le.id_leccion FROM leccion le JOIN nivel n ON n.id_nivel = le.id_nivel JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 8));

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Un documento HTML es como un edificio: html es la estructura completa, head contiene los planos y metadatos, y body contiene las salas visibles para el visitante.

NIVEL LOGICO
El navegador recibe el documento, identifica el DOCTYPE, construye el arbol html, procesa head y despues pinta body en el orden recibido.

NIVEL SINTACTICO
Usa <!DOCTYPE html>, <html>, <head> y <body>. El contenido visible debe vivir dentro de body.

PROBLEMA ABP
El equipo de CodeAscent necesita publicar la ficha de una expedicion. Construye un documento HTML5 valido con una zona de metadatos y una zona visible para el jugador.

REQUISITO TECNICO
Debe existir html, head y body, ademas de una declaracion DOCTYPE.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 1)
    AND titulo = 'Estructura Fundamental de HTML5';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Los encabezados son los titulos de un libro y los parrafos son sus bloques de explicacion. h1 representa el titulo principal; h2 a h6 organizan subtemas; p contiene texto normal.

NIVEL LOGICO
El navegador crea bloques en el arbol DOM. Cada encabezado conserva su jerarquia y cada parrafo se coloca como una unidad independiente.

NIVEL SINTACTICO
Escribe <h1>Titulo</h1>, <h2>Subtitulo</h2> y <p>Descripcion</p>. No uses encabezados solo para cambiar el tamano visual.

PROBLEMA ABP
La portada de una expedicion necesita un titulo principal y una descripcion para que visitantes y lectores de pantalla comprendan el objetivo.

REQUISITO TECNICO
Incluye al menos un h1 y un p relacionados con la expedicion.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 2)
    AND titulo = 'Jerarquía de Texto y Títulos';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Un enlace es un puente: el texto visible es el letrero y href indica hacia que destino conduce.

NIVEL LOGICO
El navegador crea un elemento interactivo solo cuando encuentra una etiqueta a con un destino href interpretable.

NIVEL SINTACTICO
Usa <a href="/mapa">Ir al mapa</a>. href puede contener una ruta relativa o una URL absoluta.

PROBLEMA ABP
La base de operaciones necesita un menu que dirija al mapa, al manual y al panel de progreso.

REQUISITO TECNICO
Incluye un enlace a con un atributo href no vacio.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 3)
    AND titulo = 'Hipervínculos y Atributos';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Una imagen es una senal visual y alt es su descripcion alternativa para quien no puede verla.

NIVEL LOGICO
El navegador solicita el recurso indicado por src. Si falla, alt mantiene la informacion disponible para accesibilidad y contexto.

NIVEL SINTACTICO
Usa <img src="expedicion.jpg" alt="Equipo explorando una cueva">. img no requiere etiqueta de cierre.

PROBLEMA ABP
El catalogo de CodeAscent necesita una imagen de cada sector que tambien pueda ser interpretada por un lector de pantalla.

REQUISITO TECNICO
Incluye img con src y alt descriptivos.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 4)
    AND titulo = 'Imágenes y Accesibilidad';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Una lista es un inventario. ul comunica elementos sin orden obligatorio y ol comunica una secuencia; li representa cada entrada.

NIVEL LOGICO
El navegador interpreta ul u ol como contenedor y espera que sus hijos directos sean elementos li.

NIVEL SINTACTICO
Usa <ul><li>HTML</li><li>CSS</li></ul> o cambia ul por ol cuando el orden importe.

PROBLEMA ABP
El equipo debe publicar los recursos necesarios para completar una expedicion sin perder la relacion entre lista y elementos.

REQUISITO TECNICO
Incluye ul u ol con al menos tres elementos li.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 5)
    AND titulo = 'Listas Estructuradas';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Una tabla es una hoja de calculo: table es la hoja, tr es una fila, th es un encabezado y td es una celda de datos.

NIVEL LOGICO
El navegador agrupa celdas dentro de filas y filas dentro de la tabla para construir una cuadricula coherente.

NIVEL SINTACTICO
Usa <table><tr><th>Nombre</th><th>Nivel</th></tr><tr><td>Cadete</td><td>1</td></tr></table>.

PROBLEMA ABP
El panel de control debe mostrar una tabla con jugadores y niveles alcanzados para que el equipo compare su avance.

REQUISITO TECNICO
Incluye table, tr y al menos una celda td dentro de una fila.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 6)
    AND titulo = 'Tablas de Datos Bidimensionales';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Un formulario es una ficha de ingreso: form agrupa la ficha, label explica cada campo, input recibe datos y button confirma la accion.

NIVEL LOGICO
El navegador relaciona controles, nombres y eventos dentro del formulario antes de enviarlos al destino configurado.

NIVEL SINTACTICO
Usa <form><label for="correo">Correo</label><input id="correo" type="email"><button>Enviar</button></form>.

PROBLEMA ABP
El registro de expedicion necesita capturar correo y aceptar el envio de la ficha del jugador.

REQUISITO TECNICO
Incluye form, label, input y button.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 7)
    AND titulo = 'Formularios y Elementos Interactivos';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
El atributo type es la regla que define el instrumento: email valida correo, number espera cantidades y date representa fechas.

NIVEL LOGICO
El navegador selecciona controles y validaciones nativas segun el valor de type antes de enviar el formulario.

NIVEL SINTACTICO
Usa <input type="email">, <input type="number"> y <input type="date">.

PROBLEMA ABP
El panel de registro debe pedir correo, nivel inicial y fecha de ingreso usando controles apropiados.

REQUISITO TECNICO
Incluye inputs de tipo email, number y date.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 8)
    AND titulo = 'Tipos de Input Avanzados';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
Las etiquetas semanticas son carteles de un edificio: header marca cabecera, nav orienta, main identifica el contenido principal, section agrupa y footer cierra la pagina.

NIVEL LOGICO
El navegador conserva el mismo flujo visual basico, pero herramientas de accesibilidad y buscadores interpretan mejor el proposito de cada region.

NIVEL SINTACTICO
Usa <header>, <nav>, <main>, <section> y <footer> en lugar de llenar todo con div.

PROBLEMA ABP
La pagina del laboratorio necesita una estructura que pueda recorrer un lector de pantalla por regiones.

REQUISITO TECNICO
Incluye header, nav, main, section y footer.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 9)
    AND titulo = 'Etiquetas Semánticas';

UPDATE leccion
SET contenido = $html_manual$
MANUAL TECNICO

NIVEL CONCEPTUAL
id es un pasaporte unico y class es el uniforme compartido por varios elementos. lang indica el idioma del documento y aria-label ofrece una etiqueta accesible.

NIVEL LOGICO
El navegador expone estos atributos al CSS, JavaScript, motores de busqueda y tecnologias de asistencia sin cambiar por si mismos el contenido visible.

NIVEL SINTACTICO
Usa <html lang="es">, <section id="mapa" class="panel" aria-label="Mapa de progreso">.

PROBLEMA ABP
El laboratorio debe identificar sus regiones y describirlas para que puedan encontrarse por estilos, scripts y lectores de pantalla.

REQUISITO TECNICO
Incluye lang, id, class y aria-label, manteniendo cada id unico.
$html_manual$
WHERE id_nivel = (SELECT n.id_nivel FROM nivel n JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = 'html' AND n.numero_nivel = 10)
    AND titulo = 'Identificadores y Clases';

-- ============================================================
-- CODEASCENT - CONTENIDO TYPESCRIPT
-- 10 MISIONES / 10 LECCIONES / 10 CUESTIONARIOS
-- ============================================================

DO $$
DECLARE
    v_id_nivel INTEGER;
    v_id_leccion INTEGER;
    v_id_reto INTEGER;
BEGIN

    -- MISIÓN 1
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 1;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 1 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Los tipos primitivos de TypeScript';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Los tipos primitivos de TypeScript', 'En TypeScript puedes indicar explícitamente qué tipo de dato almacenará una variable...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Los tipos primitivos de TypeScript' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Identifica el tipo de dato';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Identifica el tipo de dato', 'Un explorador necesita almacenar el nombre de un jugador. ¿Qué tipo primitivo de TypeScript debe utilizar?', 'opcion_multiple', 50, 'facil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Identifica el tipo de dato' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'string') THEN
        CALL sp_crear_respuesta(v_id_reto, 'string', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'number', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'boolean', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'void', FALSE);
    END IF;

    -- MISIÓN 2
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 2;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 2 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'La inferencia de tipos';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'La inferencia de tipos', 'TypeScript puede determinar automáticamente el tipo de una variable a partir del valor...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'La inferencia de tipos' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Predice el tipo inferido';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Predice el tipo inferido', 'Observa la declaración const edad = 18. ¿Qué tipo infiere TypeScript para la variable edad?', 'opcion_multiple', 100, 'facil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Predice el tipo inferido' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'number') THEN
        CALL sp_crear_respuesta(v_id_reto, 'number', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'string', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'boolean', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'any', FALSE);
    END IF;

    -- MISIÓN 3
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 3;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 3 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Arreglos y tuplas';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Arreglos y tuplas', 'Los arreglos permiten almacenar múltiples valores del mismo tipo...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Arreglos y tuplas' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Distingue arreglo y tupla';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Distingue arreglo y tupla', '¿Cuál declaración representa una tupla que contiene primero un nombre y después una edad?', 'opcion_multiple', 150, 'facil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Distingue arreglo y tupla' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = '[string, number]') THEN
        CALL sp_crear_respuesta(v_id_reto, '[string, number]', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'string[]', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'number[]', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Array<boolean>', FALSE);
    END IF;

    -- MISIÓN 4
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 4;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 4 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Interfaces y contratos de objetos';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Interfaces y contratos de objetos', 'Una interfaz describe la estructura que debe cumplir un objeto...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Interfaces y contratos de objetos' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Construye el contrato';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Construye el contrato', 'Quieres representar un jugador con un nombre de texto y un nivel numérico. ¿Cuál interfaz define correctamente esa estructura?', 'opcion_multiple', 200, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Construye el contrato' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'interface Jugador { nombre: string; nivel: number; }') THEN
        CALL sp_crear_respuesta(v_id_reto, 'interface Jugador { nombre: string; nivel: number; }', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'interface Jugador { nombre: number; nivel: string; }', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'interface Jugador { nombre, nivel }', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Jugador interface { nombre: string; nivel: number; }', FALSE);
    END IF;

    -- MISIÓN 5
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 5;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 5 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Type aliases y tipos personalizados';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Type aliases y tipos personalizados', 'Un type alias permite darle un nombre a una combinación o descripción de tipos...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Type aliases y tipos personalizados' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Reconoce un type alias';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Reconoce un type alias', '¿Cuál declaración crea un tipo llamado Identificador que puede contener un número o una cadena?', 'opcion_multiple', 250, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Reconoce un type alias' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'type Identificador = number | string;') THEN
        CALL sp_crear_respuesta(v_id_reto, 'type Identificador = number | string;', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'alias Identificador = number | string;', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'type Identificador(number, string);', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'interface Identificador = number | string;', FALSE);
    END IF;

    -- MISIÓN 6
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 6;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 6 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Funciones tipadas';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Funciones tipadas', 'Las funciones también pueden tener tipos en TypeScript...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Funciones tipadas' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Analiza el tipo de retorno';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Analiza el tipo de retorno', 'Observa la función function sumar(a: number, b: number): number. ¿Qué representa el último number?', 'opcion_multiple', 300, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Analiza el tipo de retorno' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'El tipo del valor que devuelve la función') THEN
        CALL sp_crear_respuesta(v_id_reto, 'El tipo del valor que devuelve la función', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'El tipo de la primera variable', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'La cantidad de parámetros', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'El nombre de la función', FALSE);
    END IF;

    -- MISIÓN 7
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 7;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 7 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Enums y tipos literales';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Enums y tipos literales', 'Los enums permiten representar un conjunto de valores relacionados...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Enums y tipos literales' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Controla las opciones válidas';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Controla las opciones válidas', 'Quieres que una variable estado solo pueda contener "activo", "pausado" o "finalizado". ¿Qué declaración expresa correctamente esa restricción?', 'opcion_multiple', 350, 'medio');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Controla las opciones válidas' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'type Estado = "activo" | "pausado" | "finalizado";') THEN
        CALL sp_crear_respuesta(v_id_reto, 'type Estado = "activo" | "pausado" | "finalizado";', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'type Estado = string;', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'type Estado = boolean;', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'type Estado = number;', FALSE);
    END IF;

    -- MISIÓN 8
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 8;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 8 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Clases y modificadores de acceso';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Clases y modificadores de acceso', 'Las clases permiten agrupar datos y comportamientos...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Clases y modificadores de acceso' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Protege el estado interno';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Protege el estado interno', 'Una clase contiene una propiedad que no debe poder modificarse directamente desde fuera de la clase. ¿Qué modificador expresa esta intención?', 'opcion_multiple', 400, 'dificil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Protege el estado interno' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'private') THEN
        CALL sp_crear_respuesta(v_id_reto, 'private', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'public', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'protected', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'export', FALSE);
    END IF;

    -- MISIÓN 9
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 9;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 9 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Genéricos para código reutilizable';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Genéricos para código reutilizable', 'Los genéricos permiten crear funciones, clases o estructuras...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Genéricos para código reutilizable' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Comprende el parámetro genérico';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Comprende el parámetro genérico', 'En function identidad<T>(valor: T): T, ¿qué representa T?', 'opcion_multiple', 450, 'dificil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Comprende el parámetro genérico' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'Un parámetro de tipo reutilizable') THEN
        CALL sp_crear_respuesta(v_id_reto, 'Un parámetro de tipo reutilizable', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'Una variable numérica', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'El nombre de la función', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'Una palabra reservada de JavaScript', FALSE);
    END IF;

    -- MISIÓN 10
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje WHERE LOWER(l.nombre) = LOWER('TypeScript') AND n.numero_nivel = 10;
    IF v_id_nivel IS NULL THEN RAISE EXCEPTION 'No se encontró el nivel 10 de TypeScript.'; END IF;

    SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Narrowing y Type Guards';
    IF v_id_leccion IS NULL THEN
        CALL sp_crear_leccion(v_id_nivel, 'Narrowing y Type Guards', 'Cuando una variable puede tener más de un tipo, TypeScript necesita información...', 1);
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel AND titulo = 'Narrowing y Type Guards' ORDER BY id_leccion DESC LIMIT 1;
    END IF;

    SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Aplica narrowing con typeof';
    IF v_id_reto IS NULL THEN
        CALL sp_crear_reto(v_id_leccion, 'Aplica narrowing con typeof', 'Una variable puede contener un string o un number. ¿Qué comprobación permite determinar si actualmente contiene un texto?', 'opcion_multiple', 500, 'dificil');
        SELECT id_reto INTO v_id_reto FROM reto WHERE id_leccion = v_id_leccion AND titulo = 'Aplica narrowing con typeof' ORDER BY id_reto DESC LIMIT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM respuesta WHERE id_reto = v_id_reto AND contenido = 'typeof valor === "string"') THEN
        CALL sp_crear_respuesta(v_id_reto, 'typeof valor === "string"', TRUE);
        CALL sp_crear_respuesta(v_id_reto, 'valor.type === "string"', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'typeof valor === string', FALSE);
        CALL sp_crear_respuesta(v_id_reto, 'valueof valor === "string"', FALSE);
    END IF;

END $$;

-- ============================================================
-- CUESTIONARIOS TYPESCRIPT - CODEASCENT
-- ============================================================

DO $$
DECLARE
    v_id_lenguaje INTEGER;
    v_id_nivel INTEGER;
    v_id_leccion INTEGER;
    v_id_reto INTEGER;
BEGIN

    SELECT id_lenguaje INTO v_id_lenguaje FROM lenguaje WHERE LOWER(nombre) = 'typescript';
    IF v_id_lenguaje IS NULL THEN RAISE EXCEPTION 'El lenguaje TypeScript no existe.'; END IF;

    -- CUESTIONARIO 1 - TIPOS PRIMITIVOS
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 1;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Tipos primitivos', '¿Cuál de los siguientes tipos se utiliza para almacenar texto en TypeScript?', 'opcion_multiple', 10, 'facil')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'string', true), (v_id_reto, 'number', false), (v_id_reto, 'boolean', false), (v_id_reto, 'object', false);
    END IF;

    -- CUESTIONARIO 2 - INFERENCIA
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 2;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Inferencia de tipos', 'Si declaramos let edad = 20, ¿qué tipo infiere TypeScript?', 'opcion_multiple', 15, 'facil')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'number', true), (v_id_reto, 'string', false), (v_id_reto, 'boolean', false), (v_id_reto, 'any', false);
    END IF;

    -- CUESTIONARIO 3 - ARREGLOS Y TUPLAS
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 3;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Arreglos y tuplas', '¿Cuál declaración representa correctamente una tupla [string, number]?', 'opcion_multiple', 20, 'facil')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, '[string, number]', true), (v_id_reto, '[number, string]', false), (v_id_reto, 'string[]', false), (v_id_reto, 'number[]', false);
    END IF;

    -- CUESTIONARIO 4 - INTERFACES
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 4;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Interfaces', '¿Para qué sirve principalmente una interface en TypeScript?', 'opcion_multiple', 25, 'medio')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'Definir la estructura que debe cumplir un objeto', true), (v_id_reto, 'Ejecutar código automáticamente', false), (v_id_reto, 'Crear solamente números', false), (v_id_reto, 'Eliminar tipos', false);
    END IF;

    -- CUESTIONARIO 5 - TYPE ALIASES
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 5;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Type aliases', '¿Qué palabra clave permite crear un alias de tipo en TypeScript?', 'opcion_multiple', 30, 'medio')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'type', true), (v_id_reto, 'alias', false), (v_id_reto, 'typedef', false), (v_id_reto, 'newtype', false);
    END IF;

    -- CUESTIONARIO 6 - FUNCIONES
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 6;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Funciones tipadas', '¿Dónde se indica el tipo de retorno de una función TypeScript?', 'opcion_multiple', 35, 'medio')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'Después de los paréntesis, usando : tipo', true), (v_id_reto, 'Antes del nombre usando return', false), (v_id_reto, 'Dentro de console.log()', false), (v_id_reto, 'Después de la palabra function solamente', false);
    END IF;

    -- CUESTIONARIO 7 - LITERALES
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 7;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Tipos literales', 'Si Dificultad = ''facil'' | ''medio'' | ''dificil'', ¿qué valores puede aceptar?', 'opcion_multiple', 40, 'medio')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'Solamente ''facil'', ''medio'' o ''dificil''', true), (v_id_reto, 'Cualquier string', false), (v_id_reto, 'Solamente números', false), (v_id_reto, 'Cualquier valor', false);
    END IF;

    -- CUESTIONARIO 8 - CLASES
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 8;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Clases', '¿Qué significa que una propiedad de una clase sea private?', 'opcion_multiple', 45, 'dificil')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'Solo puede utilizarse directamente dentro de la clase', true), (v_id_reto, 'Puede utilizarse desde cualquier lugar', false), (v_id_reto, 'Solo acepta números', false), (v_id_reto, 'La propiedad desaparece', false);
    END IF;

    -- CUESTIONARIO 9 - GENÉRICOS
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 9;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Genéricos', '¿Qué representa normalmente T en una función genérica como function mostrar<T>()?', 'opcion_multiple', 50, 'dificil')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'Un tipo que se determina al utilizar la función', true), (v_id_reto, 'Siempre un string', false), (v_id_reto, 'Siempre un número', false), (v_id_reto, 'Una variable global', false);
    END IF;

    -- CUESTIONARIO 10 - NARROWING
    SELECT n.id_nivel INTO v_id_nivel FROM nivel n WHERE n.id_lenguaje = v_id_lenguaje AND n.numero_nivel = 10;
    SELECT l.id_leccion INTO v_id_leccion FROM leccion l WHERE l.id_nivel = v_id_nivel ORDER BY l.orden LIMIT 1;
    IF NOT EXISTS (SELECT 1 FROM reto WHERE id_leccion = v_id_leccion AND tipo_reto = 'opcion_multiple') THEN
        INSERT INTO reto (id_leccion, titulo, descripcion, tipo_reto, xp_recompensa, dificultad)
        VALUES (v_id_leccion, 'Cuestionario: Narrowing', '¿Qué operador puede utilizarse para comprobar si un valor es string o number?', 'opcion_multiple', 60, 'dificil')
        RETURNING id_reto INTO v_id_reto;

        INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES
            (v_id_reto, 'typeof', true), (v_id_reto, 'instance', false), (v_id_reto, 'checktype', false), (v_id_reto, 'istype', false);
    END IF;

    RAISE NOTICE 'Los 10 cuestionarios TypeScript fueron creados correctamente.';

END $$;

-- ============================================================
-- CODEASCENT - CONTENIDO MISIONES DE SQL (10 NIVELES ABP Y PISTAS)
-- ============================================================

-- Garantiza una leccion real para cada nivel SQL. No se usan IDs fijos porque
-- pueden cambiar cuando la base se carga sobre datos existentes.
DO $$
DECLARE
    nivel_sql RECORD;
    titulo_leccion TEXT;
    contenido_leccion TEXT;
BEGIN
    FOR nivel_sql IN
        SELECT n.id_nivel, n.numero_nivel, n.nombre
        FROM nivel n
        INNER JOIN lenguaje l ON l.id_lenguaje = n.id_lenguaje
        WHERE LOWER(TRIM(l.nombre)) = 'sql'
        ORDER BY n.numero_nivel
    LOOP
        IF NOT EXISTS (SELECT 1 FROM leccion WHERE id_nivel = nivel_sql.id_nivel) THEN
            titulo_leccion := CASE nivel_sql.numero_nivel
                WHEN 1 THEN 'Fundamentos de consulta SQL'
                WHEN 2 THEN 'Proyección de columnas'
                WHEN 3 THEN 'Filtros con WHERE'
                WHEN 4 THEN 'Ordenamiento y limites'
                WHEN 5 THEN 'Funciones de agregacion'
                WHEN 6 THEN 'Agrupamiento de datos'
                WHEN 7 THEN 'Cruce de tablas con INNER JOIN'
                WHEN 8 THEN 'Uniones externas con LEFT JOIN'
                WHEN 9 THEN 'Subconsultas SQL'
                WHEN 10 THEN 'Manipulacion de datos DML'
                ELSE nivel_sql.nombre
            END;
            contenido_leccion := 'Estudia el concepto del nivel y aplica la sintaxis SQL solicitada en la mision.';
            CALL sp_crear_leccion(nivel_sql.id_nivel, titulo_leccion, contenido_leccion, 1);
        END IF;
    END LOOP;
END $$;

DO $$
DECLARE
    v_id_lenguaje INTEGER;
    v_id_nivel INTEGER;
    v_id_leccion INTEGER;
    v_id_reto INTEGER;
BEGIN

    SELECT id_lenguaje INTO v_id_lenguaje FROM lenguaje WHERE LOWER(nombre) = 'sql';
    IF v_id_lenguaje IS NULL THEN RAISE EXCEPTION 'El lenguaje SQL no existe en la base de datos.'; END IF;

    -- MISIÓN 1
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 1;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'Una Base de Datos Relacional agrupa información en tablas, filas y columnas. La ejecución en SQL inicia evaluando la fuente en el FROM y luego proyectando en el SELECT.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Consulta total de catálogo',
                'Escribe una consulta SQL en la terminal que muestre todos los registros y todas las columnas guardadas en la tabla libros.',
                'Acabas de incorporarte como administrador de datos en la Biblioteca Municipal. El encargado del catálogo necesita verificar el estado actual de los registros digitales.',
                'libros (id INT, titulo VARCHAR, autor VARCHAR, año_publicacion INT, stock INT)',
                '["Para visualizarlos todos, piensa en la tabla como un catálogo completo.", "Recuerda utilizar SELECT combinado con el comodín * y la cláusula FROM.", "El nombre de la tabla es libros.", "SELECT * FROM libros;"]'::jsonb,
                'codigo', 50, 'facil'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT * FROM libros;', TRUE);
        END IF;
    END IF;

    -- MISIÓN 2
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 2;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'Para seleccionar múltiples columnas específicas, se enumeran explícitamente separándolas por comas sin dejar comas al final antes del FROM.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Proyección de productos',
                'Escribe una consulta SQL para extraer únicamente las columnas nombre y precio de todos los registros de la tabla productos.',
                'La Farmacia Vida Sana va a imprimir una cartela informativa de precios rápida. Por privacidad, solo se deben mostrar el nombre y precio.',
                'productos (id_producto INT, nombre VARCHAR, costo_proveedor DECIMAL, precio DECIMAL, receta_medica BOOLEAN)',
                '["Evita el uso del comodín *.", "Escribe SELECT seguido del primer campo, una coma, y el segundo campo.", "Los campos son nombre y precio en la tabla productos.", "SELECT nombre, precio FROM productos;"]'::jsonb,
                'codigo', 100, 'facil'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT nombre, precio FROM productos;', TRUE);
        END IF;
    END IF;

    -- MISIÓN 3
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 3;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'La cláusula WHERE se ejecuta inmediatamente después del FROM y antes del SELECT. Las cadenas de texto y fechas llevan comillas simples obligatorias.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Facturas pendientes',
                'Selecciona todas las columnas de la tabla facturas cuyo campo estado sea exactamente igual a Pendiente.',
                'El Taller Mecánico Automotriz Exprés está organizando su gestión de cobranzas y necesita un reporte de las facturas no pagadas.',
                'facturas (id_factura INT, cliente VARCHAR, monto_total DECIMAL, estado VARCHAR)',
                '["Debes usar una condición de filtrado horizontal.", "Incorpora la cláusula WHERE al final de tu SELECT * FROM facturas.", "La palabra Pendiente debe ir entre comillas simples.", "SELECT * FROM facturas WHERE estado = ''Pendiente'';"]'::jsonb,
                'codigo', 150, 'facil'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT * FROM facturas WHERE estado = ''Pendiente'';', TRUE);
        END IF;
    END IF;

    -- MISIÓN 4
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 4;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'Se utiliza ORDER BY con los modificadores ASC (ascendente) o DESC (descendente). LIMIT acota el número máximo de tuplas retornadas.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Salón de la fama TOP 3',
                'Escribe una consulta para extraer el nombre y el puntaje de la tabla jugadores, ordenados de mayor a menor según su puntaje, limitando a 3 filas.',
                'El videojuego CyberArena requiere desplegar en su pantalla principal el TOP 3 de jugadores con mejores puntajes.',
                'jugadores (id_jugador INT, nombre VARCHAR, nivel INT, puntaje INT)',
                '["Requieres ordenar de forma descendente y cortar en la tercera fila.", "Combina ORDER BY puntaje DESC con la cláusula LIMIT.", "Agrega LIMIT 3 al final.", "SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3;"]'::jsonb,
                'codigo', 200, 'medio'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT nombre, puntaje FROM jugadores ORDER BY puntaje DESC LIMIT 3;', TRUE);
        END IF;
    END IF;

    -- MISIÓN 5
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 5;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'COUNT cuenta filas no nulas, SUM suma valores numéricos, AVG obtiene promedios y MIN/MAX identifican extremos.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Auditoría de activos',
                'Escribe una consulta SQL que devuelva el cálculo de la suma total de la columna precio acumulada en la tabla inventario.',
                'El departamento financiero del supermercado El Globo necesita conocer la suma total de dinero representada en su inventario.',
                'inventario (id_producto INT, nombre_producto VARCHAR, categoria VARCHAR, precio DECIMAL)',
                '["Necesitas reducir las filas de la columna precio a un único valor acumulado.", "Usa la función de agregación SUM.", "Encierra entre paréntesis la columna precio: SUM(precio).", "SELECT SUM(precio) FROM inventario;"]'::jsonb,
                'codigo', 250, 'medio'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT SUM(precio) FROM inventario;', TRUE);
        END IF;
    END IF;

    -- MISIÓN 6
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 6;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'Cualquier columna presente en el SELECT que no sea función de agregación debe estar declarada obligatoriamente en el GROUP BY.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Conteo por departamentos',
                'Selecciona la columna departamento y COUNT(*), agrúpalos por departamento y muestra solo los departamentos con más de 4 empleados.',
                'Recursos Humanos necesita un informe del conteo de empleados por departamento, excluyendo áreas con 4 o menos trabajadores.',
                'empleados (id_empleado INT, nombre VARCHAR, departamento VARCHAR, salario DECIMAL)',
                '["Clasifica por departamento y cuenta integrantes.", "Añade GROUP BY departamento y filtra con HAVING.", "Aplica HAVING COUNT(*) > 4.", "SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4;"]'::jsonb,
                'codigo', 300, 'medio'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT departamento, COUNT(*) FROM empleados GROUP BY departamento HAVING COUNT(*) > 4;', TRUE);
        END IF;
    END IF;

    -- MISIÓN 7
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 7;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'La cláusula ON define la regla de intersección estricta. Si un registro no coincide en ambas tablas, es descartado.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Listado de inscripciones',
                'Combina la tabla estudiantes con la tabla cursos mediante INNER JOIN, seleccionando estudiantes.nombre y cursos.nombre_curso donde estudiantes.curso_id = cursos.id.',
                'La Academia Digital requiere emitir el listado oficial de estudiantes junto con el nombre del curso asignado.',
                'estudiantes (id INT, nombre VARCHAR, curso_id INT) | cursos (id INT, nombre_curso VARCHAR, creditos INT)',
                '["Cruza dos tablas para conectar estudiantes y cursos.", "Usa FROM estudiantes INNER JOIN cursos ON condición.", "La condición es estudiantes.curso_id = cursos.id.", "SELECT estudiantes.nombre, cursos.nombre_curso FROM estudiantes INNER JOIN cursos ON estudiantes.curso_id = cursos.id;"]'::jsonb,
                'codigo', 350, 'dificil'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT estudiantes.nombre, cursos.nombre_curso FROM estudiantes INNER JOIN cursos ON estudiantes.curso_id = cursos.id;', TRUE);
        END IF;
    END IF;

    -- MISIÓN 8
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 8;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'En un LEFT JOIN, la tabla de la izquierda es dominante. Si no encuentra coincidencia en la derecha, los campos faltantes se rellenan con NULL.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Auditoría de vendedores',
                'Escribe una consulta SQL que preserve a todos los vendedores de la tabla vendedores usando LEFT JOIN hacia ventas basándose en vendedores.id = ventas.vendedor_id.',
                'El Director Comercial desea auditar las ventas del mes obligando a que aparezcan todos los vendedores incluso si no tienen ventas.',
                'vendedores (id INT, nombre VARCHAR, sucursal VARCHAR) | ventas (id INT, vendedor_id INT, monto DECIMAL)',
                '["Usa una unión externa para mantener vendedores sin ventas.", "Pon vendedores en el FROM y conéctalo con LEFT JOIN ventas.", "La condición de enlace es vendedores.id = ventas.vendedor_id.", "SELECT vendedores.nombre, ventas.id FROM vendedores LEFT JOIN ventas ON vendedores.id = ventas.vendedor_id;"]'::jsonb,
                'codigo', 400, 'dificil'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT vendedores.nombre, ventas.id FROM vendedores LEFT JOIN ventas ON vendedores.id = ventas.vendedor_id;', TRUE);
        END IF;
    END IF;

    -- MISIÓN 9
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 9;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'La subconsulta interna se evalúa primero y su valor escalar reemplaza la posición dinámica antes de ejecutar la consulta externa.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Bono por mérito',
                'Escribe una consulta anidada que proyecte nombre y salario de la tabla empleados con un filtro WHERE salario > alimentado por (SELECT AVG(salario) FROM empleados).',
                'La empresa otorga un bono especial a los trabajadores cuyo sueldo sea strictly mayor al salario promedio de la compañía.',
                'empleados (id_empleado INT, nombre VARCHAR, puesto VARCHAR, salario DECIMAL)',
                '["Escribe una subconsulta interna que calcule el promedio.", "Forma la consulta externa SELECT nombre, salario FROM empleados WHERE salario >.", "Añade la subconsulta entre paréntesis: (SELECT AVG(salario) FROM empleados).", "SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados);"]'::jsonb,
                'codigo', 450, 'dificil'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados);', TRUE);
        END IF;
    END IF;

    -- MISIÓN 10
    SELECT id_nivel INTO v_id_nivel FROM nivel WHERE id_lenguaje = v_id_lenguaje AND numero_nivel = 10;
    IF v_id_nivel IS NOT NULL THEN
        SELECT id_leccion INTO v_id_leccion FROM leccion WHERE id_nivel = v_id_nivel ORDER BY id_leccion LIMIT 1;
        IF v_id_leccion IS NOT NULL THEN
            UPDATE leccion SET 
                manual_tecnico = 'Una instrucción UPDATE sin cláusula WHERE alterará la totalidad de las filas de la tabla de forma indiscriminada.'
            WHERE id_leccion = v_id_leccion;

            INSERT INTO reto (id_leccion, titulo, descripcion, contexto_abp, esquema_bd, pistas, tipo_reto, xp_recompensa, dificultad)
            VALUES (
                v_id_leccion,
                'Ajuste inflacionario de precios',
                'Escribe una instrucción UPDATE para la tabla productos asignando precio = precio * 1.10 acotando la operación mediante WHERE categoria = Electrónica.',
                'La tienda MegaStore requiere ajustar precios aplicando un incremento del 10% exclusivamente a los productos de la categoría Electrónica.',
                'productos (id_producto INT, nombre VARCHAR, categoria VARCHAR, precio DECIMAL)',
                '["Usa la sentencia DML UPDATE.", "Aplica la fórmula SET precio = precio * 1.10.", "Delimita la alteración con WHERE categoria = ''Electrónica''.", "UPDATE productos SET precio = precio * 1.10 WHERE categoria = ''Electrónica'';"]'::jsonb,
                'codigo', 500, 'dificil'
            ) RETURNING id_reto INTO v_id_reto;

            INSERT INTO respuesta (id_reto, contenido, es_correcta) VALUES (v_id_reto, 'UPDATE productos SET precio = precio * 1.10 WHERE categoria = ''Electrónica'';', TRUE);
        END IF;
    END IF;

    RAISE NOTICE 'Las 10 Misiones Gamificadas de SQL fueron vinculadas exitosamente.';

END $$;