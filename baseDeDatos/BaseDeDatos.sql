-- ═══════════════════════════════════════════════════════════
-- BaseDeDatos.sql
-- Schema completo de la base de datos
-- Encuentra tu Cargador — Informática II
-- Autores: Gabriel Kaakedjian, Gabriel Peña
-- ═══════════════════════════════════════════════════════════

-- Crear y seleccionar la base de datos
CREATE DATABASE encuentraTuCargador
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE encuentraTuCargador;

-- ═══════════════════════════════════════════════════════════
-- TABLA: roles
-- ═══════════════════════════════════════════════════════════
CREATE TABLE roles (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ═══════════════════════════════════════════════════════════
-- TABLA: usuarios
-- ═══════════════════════════════════════════════════════════
CREATE TABLE usuarios (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    nombreUsuario VARCHAR(100) NOT NULL UNIQUE,
    contrasena    VARCHAR(255) NOT NULL,
    idRol         INT          NOT NULL,
    timestamp     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idRol) REFERENCES roles(id) ON DELETE RESTRICT
);

-- ═══════════════════════════════════════════════════════════
-- TABLA: cargadores
-- ═══════════════════════════════════════════════════════════
CREATE TABLE cargadores (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(150)                              NOT NULL,
    direccion      VARCHAR(255)                              NOT NULL,
    latitud        DECIMAL(10, 8)                            NOT NULL,
    longitud       DECIMAL(11, 8)                            NOT NULL,
    tipo           ENUM('rapido', 'estandar', 'compatible')  NOT NULL DEFAULT 'estandar',
    estado         ENUM('libre', 'ocupado', 'en_reparacion') NOT NULL DEFAULT 'libre',
    nivelBateria   INT                                       NOT NULL DEFAULT 100,
    tiempoEstimado INT                                       NOT NULL DEFAULT 30,
    coste          DECIMAL(5, 2)                             NOT NULL DEFAULT 0.00
);

-- ═══════════════════════════════════════════════════════════
-- TABLA: reservas
-- ═══════════════════════════════════════════════════════════
CREATE TABLE reservas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario       INT                                        NOT NULL,
    idCargador      INT                                        NOT NULL,
    fechaReserva    DATETIME                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaExpiracion DATETIME                                   NOT NULL,
    estado          ENUM('activa', 'completada', 'cancelada') NOT NULL DEFAULT 'activa',
    FOREIGN KEY (idUsuario)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (idCargador) REFERENCES cargadores(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════
-- TABLA: favoritos
-- ═══════════════════════════════════════════════════════════
CREATE TABLE favoritos (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario     INT      NOT NULL,
    idCargador    INT      NOT NULL,
    fechaGuardado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unicoFavorito (idUsuario, idCargador),
    FOREIGN KEY (idUsuario)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (idCargador) REFERENCES cargadores(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════
-- TABLA: sesiones
-- ═══════════════════════════════════════════════════════════
CREATE TABLE sesiones (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario       INT          NOT NULL,
    nombreUsuario   VARCHAR(100) NOT NULL,
    tipoDispositivo TEXT         NOT NULL,
    direccionIP     VARCHAR(45)  NOT NULL,
    fechaHora       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════
-- TABLA: notificaciones
-- ═══════════════════════════════════════════════════════════
CREATE TABLE notificaciones (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario  INT        NOT NULL,
    idCargador INT        NOT NULL,
    mensaje    TEXT       NOT NULL,
    fechaEnvio DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida      TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (idUsuario)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (idCargador) REFERENCES cargadores(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════
-- DATOS INICIALES: roles
-- ═══════════════════════════════════════════════════════════
INSERT INTO roles (id, nombre) VALUES
(1, 'administrador'),
(2, 'tecnico'),
(3, 'usuario');

-- ═══════════════════════════════════════════════════════════
-- DATOS INICIALES: usuarios (contraseñas cifradas con bcrypt)
-- idRol: 1=administrador, 2=tecnico, 3=usuario
-- ═══════════════════════════════════════════════════════════
INSERT INTO usuarios (nombre, apellido, nombreUsuario, contrasena, idRol) VALUES
('Admin',   'Principal', 'Administrador', '$2b$10$Hv.UxGmpkL4AzllaNYuvuuwHvFsChNF/EVsmJI9aFarjIxxW1i35S', 1),
('Tecnico', 'Uno',       'Tecnico1',      '$2b$10$9uWoBdZtAg9jX/Ip7FsT1OzK.gCrAbDETfobl3k1bvLYePpwAJYDW', 2),
('Tecnico', 'Dos',       'Tecnico2',      '$2b$10$fSWi3rt80MFvvX0kVTlHLus/CJUe1tTDyuB/287JKwtKF57kM.2MK', 2),
('Usuario', 'Uno',       'Usuario1',      '$2b$10$IilZSmPX.cLwJzzYBCQbIegKth7f97PzEmmsmdhlNK1R.xyCwy2rm', 3),
('Usuario', 'Dos',       'Usuario2',      '$2b$10$16GGBs4o3ETSzfRzuFERuu9Tfj0yqgy9tWwA0bivlFo8zD8/OgAOu', 3),
('Usuario', 'Tres',      'Usuario3',      '$2b$10$h8L6cFMFErRvt91yCyPtH.rcKFthhubXwyQXL457w9SFVfXHUTZ9C', 3),
('Usuario', 'Cuatro',    'Usuario4',      '$2b$10$s287yrTsRk.cxXbYJAKES.Jwifzn0Dy3f9lk9AbUhfsUrNDXmEh5a', 3);

-- ═══════════════════════════════════════════════════════════
-- DATOS INICIALES: cargadores de ejemplo
-- ═══════════════════════════════════════════════════════════
INSERT INTO cargadores (nombre, direccion, latitud, longitud, tipo, estado, nivelBateria, tiempoEstimado, coste) VALUES
('Cargador Centro 1',    'Calle Gran Via 1, Madrid',           40.41650000, -3.70347000, 'rapido',     'libre',         100, 20, 0.35),
('Cargador Centro 2',    'Calle Alcala 50, Madrid',            40.41900000, -3.69500000, 'estandar',   'libre',         100, 45, 0.20),
('Cargador Norte 1',     'Paseo de la Castellana 100, Madrid', 40.44500000, -3.69200000, 'rapido',     'ocupado',       100, 30, 0.35),
('Cargador Norte 2',     'Calle Bravo Murillo 10, Madrid',     40.44800000, -3.70100000, 'compatible', 'libre',         100, 60, 0.15),
('Cargador Sur 1',       'Calle Toledo 30, Madrid',            40.40200000, -3.70800000, 'estandar',   'en_reparacion', 100, 45, 0.20),
('Cargador Retiro 1',    'Parque del Retiro, Madrid',          40.41500000, -3.68200000, 'rapido',     'libre',         100, 20, 0.35),
('Cargador Salamanca 1', 'Calle Serrano 80, Madrid',           40.42800000, -3.68600000, 'estandar',   'libre',         100, 45, 0.20);