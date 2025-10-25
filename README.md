# Auditoría — Sistema de Autenticación (Cliente-Servidor)

Última actualización: 2025-10-24

## Descripción

Proyecto didáctico que implementa un sistema de autenticación con arquitectura cliente-servidor. Muestra varios métodos de autenticación (básico en texto plano, contraseñas hasheadas con bcrypt y login con Google) y cómo interactúan un frontend React (Vite + TypeScript) y un backend Node.js/Express con una base de datos relacional (MySQL).

El sistema incluye además un inventario automotriz (listado de vehículos) y mantiene un registro de los inicios de sesión realizados por cada usuario.

## Objetivo

Desarrollar y documentar una aplicación que permita:

- Probar diferentes estrategias de autenticación y comparar seguridad.
- Registrar eventos de inicio de sesión (logs).
- Mantener un inventario de vehículos (listado, creación básica).

> Nota: Este proyecto es educativo. Algunas implementaciones (p. ej. autenticación básica en texto plano) están incluidas únicamente para estudio y deben evitarse en producción.

## Tecnologías

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- Base de datos: MySQL (o MariaDB)
- Autenticación/criptografía: bcrypt
- Desarrollo: nodemon, vite

## Estructura del proyecto

```
Auditoria/
├─ backend/
│  ├─ /config/
│  |  └─ db.js
│  ├─ /controllers/
│  │  ├─ auditoriaController.js
│  │  ├─ authController.js
│  │  ├─ mfaController.js
│  │  └─ vehiculosController.js
│  ├─ /middlewares/
│  │  ├─ auditoriaMiddleware.js
│  │  ├─ backoffMiddleware.js
│  │  ├─ verificarRol.js
│  │  └─ verificarToken.js
│  ├─ /models/
│  |  ├─ logModel.js
│  |  ├─ usuarioModel.js
│  |  └─ vehiculoModel.js
│  ├─ /routes/
│  │  ├─ auditoria.js
│  │  ├─ auth.js
│  │  ├─ mfa.js
│  │  └─ vehiculos.js
│  ├─ .env
│  └─ server.js
|
├─ frontend/
|  ├─ src/
|  |  ├─ components/
|  |  |  └─ Navbar.tsx
|  |  ├─ pages/
|  |  │  ├─ Auditoria.tsx
|  |  │  ├─ Inventario.tsx
|  |  │  ├─ LoginBasico.tsx
|  |  │  ├─ LoginCifrado.tsx
|  |  │  ├─ LoginGoogle.tsx
|  |  │  └─ Registro.tsx
|  |  ├─ main.tsx
|  |  ├─ App.tsx
|  |  ├─ styles.css
|  └─ .env
└─ readme.md
```

## Base de datos — Esquema inicial (MySQL)

Ejemplo SQL mínimo para crear las tablas usadas por el backend. Ajusta según tus necesidades.

```sql
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  tipo_autenticacion ENUM('basico','cifrado','google') DEFAULT 'basico',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehiculos (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  anio INT,
  precio DECIMAL(12,2),
  estado ENUM('Disponible','Vendido','En mantenimiento') DEFAULT 'Disponible',
  kilometraje INT,
  color VARCHAR(50),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs_sesion (
  id_log INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  metodo VARCHAR(50),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detalles TEXT,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
```

## API — Endpoints principales

Base URL: `http://localhost:3000` (o el puerto definido en `.env`)

Rutas de autenticación (`/auth`):

- `POST /auth/registro` — Registrar usuario
  - Body (JSON): `{ nombre, email, password, tipo_autenticacion }`

- `POST /auth/loginBasico` — Login sin cifrado (texto plano)
  - Body: `{ email, password }`

- `POST /auth/loginSeguro` — Login con hash (bcrypt)
  - Body: `{ email, password }`

- `POST /auth/loginGoogle` — Login/registro con Google (simulado o con token enviado desde frontend)
  - Body: `{ email, nombre }`

Rutas de inventario (`/vehiculos`):

- `GET /vehiculos` — Listar vehículos
- `GET /vehiculos/:id` — Obtener vehículo por id
- `POST /vehiculos` — Crear vehículo (body con campos de vehículo)
- `PUT /vehiculos/:id` — Actualizar vehículo
- `DELETE /vehiculos/:id` — Eliminar vehículo
## Requerimientos avanzados implementados / por implementar

A continuación se documentan los requisitos adicionales que has añadido al proyecto: roles y permisos, MFA, expiración corta de JWT (2 minutos), protección anti-brute-force mediante Exponential Backoff y un sistema de auditoría/logging para análisis posterior (posible uso de ML).

### Roles y permisos

Se definen tres roles principales con permisos diferenciados:

- Visitante
  - Acceso público de sólo lectura al catálogo de vehículos.

- Administrador
  - CRUD completo del inventario automotriz.
  - Eliminación lógica (soft delete) de registros: los registros se marcan con `deleted_at` en lugar de eliminarse físicamente.

- Super-administrador
  - Gestión completa de usuarios (crear, editar, eliminar, cambiar roles).
  - Acceso a dashboard de métricas de auditoría y logs.
  - Todos los privilegios de administrador.

### Inventario: soft delete

Recomendación de schema para soft delete en `vehiculos`:

```sql
ALTER TABLE vehiculos ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL;
-- En las consultas públicas filtrar WHERE deleted_at IS NULL
```

### Autenticación Multi-Factor (MFA)

Requisitos y notas de diseño:

- El sistema debe soportar un segundo factor (TOTP, SMS o servicio externo tipo Duo). Para evaluación recomendamos TOTP (Google Authenticator) o integración con `@duosecurity/duo_api` si se dispone de cuenta.
- Flujo sugerido:
  1. Usuario se autentica con credenciales (password). Si el método es `cifrado`, validar con bcrypt.
  2. Si el usuario tiene MFA habilitado, generar y enviar un token TOTP o solicitar segundo factor.
  3. Al completar MFA emitir un JWT con los claims definidos (ver siguiente sección).

- Implementación mínima: servicio `backend/services/mfa/` con helpers para generar/validar TOTP (por ejemplo con `otplib`) y endpoints para enrolamiento y verificación.

### JWT y claims

Reglas y recomendaciones:

- Al emitir el JWT incluir claims mínimos y útiles para auditoría y autorización:

```json
{
  "id_usuario": 123,
  "email": "user@ejemplo.com",
  "rol": "admin",
  "tipo_autenticacion": "cifrado",
  "mfa": true,
  "iat": 1698123456,
  "exp": 1698123576, // expiración a 2 minutos (120s) para la evaluación
  "jti": "uuid-v4"
}
```

- Tiempo de expiración (exp): 2 minutos (120 segundos) en tokens de acceso para esta evaluación.
- Se recomienda emitir además un refresh token con mayor caducidad si se desea mantener sesiones más largas (fuera del scope de la calificación).

### Protección Anti-Brute Force — Exponential Backoff

Descripción general:

- Implementar por IP (y opcionalmente por email/username) un contador de intentos fallidos.
- Algoritmo básico:
  - Mantener un registro en memoria/Redis/DB con: { ip, attempts, lastAttemptAt, nextAllowedAt }
  - Ante un fallo incrementar `attempts` y calcular `delay = baseDelay * 2^(attempts-1)` (por ejemplo baseDelay = 1s).
  - Establecer `nextAllowedAt = now + delay` y responder al cliente con un código 429 y el tiempo restante.
  - Permitir reset de contador tras un login exitoso o pasada una ventana de tiempo (decay window).

Ejemplo de pseudocódigo (middleware `backend/middleware/backoff.js`):

```js
const baseDelay = 1000; // 1s
const maxDelay = 60 * 1000; // 1 min (opcional)

function onFailedAttempt(ip) {
  const record = store.get(ip) || { attempts: 0 };
  record.attempts += 1;
  const delay = Math.min(baseDelay * Math.pow(2, record.attempts - 1), maxDelay);
  record.nextAllowedAt = Date.now() + delay;
  store.set(ip, record);
  return delay;
}

function middleware(req, res, next) {
  const ip = req.ip;
  const record = store.get(ip);
  if (record && record.nextAllowedAt && Date.now() < record.nextAllowedAt) {
    const waitMs = record.nextAllowedAt - Date.now();
    return res.status(429).json({ message: 'Too many attempts. Try later.', retry_after_ms: waitMs });
  }
  next();
}
```

Recomendaciones de implementación:

- Usar Redis para acumuladores distribuidos si el sistema se escala.
- Para pruebas locales un store en memoria o una tabla SQL temporal es suficiente.
- Pausas y límites deben ser razonables para la evaluación (ej. cap máximo de 1–2 minutos).

### Auditoría y Logging

Requisitos:

- Guardar logs de autenticación: intentos exitosos y fallidos, IP, user-agent, endpoint, timestamp, motivo (p.ej. contraseña incorrecta).
- Guardar request por endpoint y metadata (method, path, body hash / size, response code, duration) para análisis posterior.
- Mantener los datos estructurados para poder alimentar un pipeline de ML (detección de anomalías).

Tablas sugeridas (añadir al esquema MySQL):

```sql
CREATE TABLE auth_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NULL,
  email VARCHAR(255) NULL,
  ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(512),
  success BOOLEAN NOT NULL,
  motivo VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE request_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255),
  method VARCHAR(10),
  ip VARCHAR(45),
  user_agent VARCHAR(512),
  body_hash VARCHAR(128) NULL,
  response_code INT,
  duration_ms INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nivel ENUM('INFO','WARN','ERROR','SECURITY'),
  componente VARCHAR(100),
  descripcion TEXT,
  metadata JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Carpetas y archivos recomendados (backend)

- `backend/middleware/`
  - `auth.js` — validar JWT y claims
  - `roles.js` — comprobar permisos por rol
  - `backoff.js` — middleware de exponential backoff
  - `auditLogger.js` — middleware para registrar cada request en `request_logs`

- `backend/services/`
  - `mfa/` — helpers para TOTP (enrolamiento, verificación)
  - `backoff/` — store y utilidades (si se usa Redis)
  - `audit/` — funciones para guardar `auth_attempts` y `audit_events`

- `backend/routes/admin.js` — endpoints para gestión de usuarios y dashboard
- `backend/controllers/auditController.js` — endpoints para obtener métricas y logs

### Frontend — nuevos componentes / páginas sugeridas

- `src/pages/Dashboard.tsx` — vista para super-administrador con gráficos (puede usar Chart.js o Recharts)
- `src/pages/MFASetup.tsx` — flujo de enrolamiento y verificación MFA
- `src/components/ProtectedRoute.tsx` — ruta que valida JWT y roles

### Ejemplos y scripts para pruebas (brute force)

Script de ejemplo (PowerShell) para probar múltiples intentos contra `/auth/loginBasico`:

```powershell
$url = 'http://localhost:3000/auth/loginBasico'
for ($i=1; $i -le 50; $i++) {
  $body = @{ email = 'victim@domain' ; password = 'wrong'+$i } | ConvertTo-Json
  $r = Invoke-RestMethod -Method Post -Uri $url -Body $body -ContentType 'application/json' -ErrorAction SilentlyContinue
  Write-Host "Attempt $i -> status: $($r | ConvertTo-Json -Compress)"
  Start-Sleep -Milliseconds 200
}
```

Al ejecutar el script deberías observar respuestas 429 y ver registros en `auth_attempts` y en la store del backoff indicando el retraso aplicado.

### Dashboard y métricas de auditoría

- Recomendación: exponer endpoints read-only para el dashboard que agreguen datos desde `request_logs` y `auth_attempts` (counts por IP, trends de intentos, top endpoints, tasa de fallos).
- Para visualización rápida usar Chart.js, Recharts o una pequeña app React que consuma `/admin/metrics`.

### Integración con Machine Learning (futuro)

- Mantén los logs estructurados y normalizados: IP, hour-of-day, success-rate, user_agent_token, request_freq, etc.
- Exportar a parquet/CSV o a ElasticSearch / ClickHouse para análisis offline y modelado.

### Testing y verificación

Checks recomendados:

- Validar que JWT expira en 2 minutos (usar token, esperar >120s y comprobar rechazo).
- Probar MFA enrolamiento y verificación (si implementado).
- Ejecutar el script de brute force y verificar entradas en `auth_attempts` y respuestas 429.
- Revisar `request_logs` para analizar patrones y latencias.

### Dependencias recomendadas

- `express-rate-limit` (sencillo rate limiter)
- `rate-limiter-flexible` (más flexible, Redis support)
- `otplib` (para TOTP)
- `uuid` (generar jti)
- `winston` o `pino` para logging estructurado
- `redis` para store de backoff y contadores distribuidos

---

