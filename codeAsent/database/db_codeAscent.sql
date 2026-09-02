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
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO intento (id_usuario, id_reto, respuesta_usuario, correcto, xp_obtenida)
    VALUES (p_id_usuario, p_id_reto, p_respuesta_usuario, p_correcto, p_xp_obtenida);
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

-- ------------------------------------------------------------
-- INSERCIÓN DE DATOS
-- ------------------------------------------------------------

-- Lenguajes
CALL sp_crear_lenguaje('SQL', 'Lenguaje estándar para la gestión, consulta y manipulación de bases de datos relacionales.', TRUE);
CALL sp_crear_lenguaje('HTML', 'Lenguaje de marcado utilizado para estructurar el contenido de las páginas y aplicaciones web.', TRUE);
CALL sp_crear_lenguaje('CSS', 'Lenguaje de estilos para diseñar y personalizar la presentación visual de interfaces web.', TRUE);
CALL sp_crear_lenguaje('TypeScript', 'Superset tipado de JavaScript diseñado para construir aplicaciones web escalables y robustas.', TRUE);

-- Usuarios
CALL sp_crear_usuario('Administrador', 'admin@codeascent.com', 'AdminPass123!', 'admin');
CALL sp_crear_usuario('Jugador Uno', 'jugador1@email.com', 'PlayerPass123!', 'jugador');

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
