-- =============================================
-- ECORRUTAS – Schema inicial PostgreSQL + PostGIS
-- Ejecutar como superusuario o usuario con permisos
-- =============================================

-- Habilitar extensión espacial (ejecutar una sola vez)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: usuarios
-- Conductores y administradores del sistema
-- =============================================
CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(100) NOT NULL,
    documento       VARCHAR(20)  NOT NULL UNIQUE,
    email           VARCHAR(100) UNIQUE,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20)  NOT NULL CHECK (rol IN ('admin', 'conductor')),
    activo          BOOLEAN      NOT NULL DEFAULT true,
    -- UUID que devuelve la API externa al registrar el perfil del conductor
    external_perfil_id UUID,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: vehiculos
-- =============================================
CREATE TABLE vehiculos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placa           VARCHAR(20)  NOT NULL UNIQUE,
    marca           VARCHAR(50)  NOT NULL,
    modelo          VARCHAR(50)  NOT NULL,
    capacidad_kg    INTEGER,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'operativo'
                    CHECK (estado IN ('operativo', 'averiado', 'inactivo')),
    -- UUID del vehículo en la API externa del profesor
    external_id     UUID,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: rutas
-- Geometría almacenada con PostGIS (SRID 4326 = WGS84 / GPS estándar)
-- =============================================
CREATE TABLE rutas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    -- LineString en coordenadas GPS [lng, lat] según GeoJSON
    geometria       GEOMETRY(LineString, 4326) NOT NULL,
    activa          BOOLEAN      NOT NULL DEFAULT true,
    -- UUID de la ruta en la API externa del profesor
    external_id     UUID,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índice espacial para consultas de mapa (obligatorio con PostGIS)
CREATE INDEX idx_rutas_geometria ON rutas USING GIST (geometria);

-- =============================================
-- TABLA: asignaciones
-- Relación conductor + ruta para una fecha específica
-- =============================================
CREATE TABLE asignaciones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conductor_id    UUID         NOT NULL REFERENCES usuarios(id),
    ruta_id         UUID         NOT NULL REFERENCES rutas(id),
    fecha           DATE         NOT NULL DEFAULT CURRENT_DATE,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_curso', 'completada', 'cancelada')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Un conductor no puede tener la misma ruta asignada dos veces el mismo día
    UNIQUE (conductor_id, ruta_id, fecha)
);

-- =============================================
-- TABLA: recorridos
-- Una ejecución real de una asignación
-- =============================================
CREATE TABLE recorridos (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asignacion_id       UUID         NOT NULL REFERENCES asignaciones(id),
    vehiculo_id         UUID         NOT NULL REFERENCES vehiculos(id),
    timestamp_inicio    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    timestamp_fin       TIMESTAMPTZ,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'en_curso'
                        CHECK (estado IN ('en_curso', 'completado', 'suspendido')),
    -- UUID del recorrido en la API externa (necesario para enviar posiciones)
    external_id         UUID,
    -- Bandera para detectar recorridos que superaron 24h sin cierre manual
    suspendido_auto     BOOLEAN      NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLA: posiciones
-- Cada punto GPS capturado durante un recorrido
-- =============================================
CREATE TABLE posiciones (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recorrido_id            UUID         NOT NULL REFERENCES recorridos(id),
    lat                     DECIMAL(10,7) NOT NULL,
    lon                     DECIMAL(10,7) NOT NULL,
    timestamp_captura       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Control de sincronización de doble persistencia
    sincronizado_backend    BOOLEAN      NOT NULL DEFAULT true,
    sincronizado_api_ext    BOOLEAN      NOT NULL DEFAULT false,
    -- Punto geográfico para consultas espaciales (opcional pero útil)
    geom                    GEOMETRY(Point, 4326)
                            GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lon, lat), 4326)) STORED,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índice para consultas por recorrido (muy frecuentes)
CREATE INDEX idx_posiciones_recorrido ON posiciones (recorrido_id);
-- Índice espacial para posiciones
CREATE INDEX idx_posiciones_geom ON posiciones USING GIST (geom);

-- =============================================
-- TABLA: password_reset_tokens
-- Tokens temporales para restablecimiento de contraseña
-- =============================================
CREATE TABLE password_reset_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expira_en       TIMESTAMPTZ  NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
    usado           BOOLEAN      NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- Índice para búsqueda rápida por token
    CONSTRAINT uq_token UNIQUE (token)
);

-- Índice para limpieza automática de tokens expirados
CREATE INDEX idx_reset_tokens_expira ON password_reset_tokens (expira_en);
CREATE INDEX idx_reset_tokens_usuario ON password_reset_tokens (usuario_id);

-- =============================================
-- DATOS INICIALES: admin por defecto
-- Contraseña: cambiar en producción (hash bcrypt de "admin123")
-- =============================================
INSERT INTO usuarios (nombre, documento, username, password_hash, rol)
VALUES (
    'Administrador',
    '000000000',
    'admin',
    '$2b$10$rLmBvbmq54gumCYX5eLIzuVLd2Dzk6GLfLgyhNEtQXYDhaRJlYVIm',
    'admin'
);
