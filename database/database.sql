-- =========================================
-- Creacion de la base de datos
-- =========================================
CREATE DATABASE auditoria;
USE auditoria;

-- =========================================
-- Usuarios del sistema
-- =========================================
CREATE TABLE users (
  user_id     INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50) NOT NULL UNIQUE,
  email       VARCHAR(120) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- Credenciales de autenticación
-- method: BASIC | HASH
-- =========================================
CREATE TABLE auth_credentials (
  cred_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  method      ENUM('BASIC','HASH') NOT NULL,
  password    VARCHAR(256) NOT NULL, -- texto plano o hash
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auth_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);

-- =========================================
-- Login con Google
-- =========================================
CREATE TABLE oauth_account (
  oauth_id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  provider_user_id  VARCHAR(128) NOT NULL, -- sub de Google
  email             VARCHAR(120) NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);

-- =========================================
-- Auditoría de inicios de sesión
-- =========================================
CREATE TABLE login_audit (
  login_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT, -- puede ser NULL si fallo sin usuario válido
  method     ENUM('BASIC','HASH','GOOGLE') NOT NULL,
  success    TINYINT(1) NOT NULL, -- 1=ok, 0=fallo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE SET NULL
);

-- =========================================
-- Inventario de vehículos
-- =========================================
CREATE TABLE vehicles (
  vehicle_id  INT AUTO_INCREMENT PRIMARY KEY,
  brand       VARCHAR(50) NOT NULL,
  model       VARCHAR(80) NOT NULL,
  year_made   YEAR NOT NULL,
  price       DECIMAL(12,2) NOT NULL,
  status      ENUM('DISPONIBLE','VENDIDO','MANTENIMIENTO') DEFAULT 'DISPONIBLE',
  mileage_km  INT,
  color       VARCHAR(40),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columna de placa (única) y soft delete si no existen
ALTER TABLE vehicles
  ADD COLUMN plate VARCHAR(20) NOT NULL UNIQUE AFTER model,
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER created_at;

CREATE INDEX ix_vehicles_active ON vehicles (is_active);
