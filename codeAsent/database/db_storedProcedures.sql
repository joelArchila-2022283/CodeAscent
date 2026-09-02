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

-- CREATE
CREATE OR REPLACE PROCEDURE sp_crear_logro(
    p_nombre VARCHAR,
    p_descripcion TEXT,
    p_xp_recompensa INTEGER DEFAULT 0,
    p_requisito TEXT
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