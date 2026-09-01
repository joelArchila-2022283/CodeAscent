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
