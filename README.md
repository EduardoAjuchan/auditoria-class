# 🛡️ Sistema de Autenticación Avanzado con Arquitectura Cliente-Servidor

Este proyecto implementa un sistema de autenticación robusto con múltiples capas de seguridad mediante arquitectura cliente-servidor, aplicado a un sistema de gestión de inventario automotriz con funcionalidades avanzadas de monitoreo y protección contra ataques.

---

## 🎯 Objetivo
Desarrollar un sistema de autenticación robusto que implemente:

### **Funcionalidades Base:**
- Autenticación básica (usuario/contraseña en texto plano, solo con fines académicos)
- Autenticación con contraseñas cifradas (MD5, SHA-256, bcrypt)
- Login con Google (OAuth 2.0)
- Gestión de inventario de vehículos (CRUD con validación de placa y soft delete)

### **Funcionalidades Avanzadas:**
- **Sistema de Roles**: VISITOR, ADMIN, SUPER_ADMIN con permisos granulares
- **Autenticación Multi-Factor (MFA)**: TOTP con Google Authenticator/Authy
- **Protección Anti-Brute Force**: Exponential Backoff por IP
- **Sistema de Auditoría**: Logging completo y dashboard de métricas
- **JWT Avanzado**: Claims personalizados y expiración configurable

---

## 🏗️ Arquitectura
- **Frontend:** Cliente que consume los servicios del backend.
- **Backend:** Servidor en **Node.js**.
- **Comunicación:** HTTP/HTTPS.
- **Base de datos:** MySQL (en Docker o local).
- **Modelo:** Arquitectura Cliente-Servidor en capas.

---

## 📂 Estructura del Proyecto

```
/backend -> Código fuente del servidor en Node.js
├── /config # Configuración general
│ └── db.js                # Conexión a la base de datos MySQL mediante mysql2 (pool)
│
├── /data # Consultas SQL a la base de datos
│ ├── auth.data.js         # Queries para usuarios, credenciales, OAuth y auditoría de login
│ └── vehicles.data.js     # Queries para CRUD de vehículos (placa única y soft delete)
│
├── /middleware # Middlewares de Express
│ ├── validate.js          # Validación de parámetros requeridos en requests
│ ├── jwt.js               # Validación JWT con claims personalizados
│ ├── roles.js             # Control de acceso basado en roles
│ ├── antibruteforce.js    # Protección Anti-Brute Force con Exponential Backoff
│ └── requestLogger.js     # Logging automático de todos los requests
│
├── /models # Modelos para transformar y tipar datos
│ ├── credential.model.js  # Normalización de credenciales
│ ├── oauth.model.js       # Normalización de datos de login con Google
│ ├── user.model.js        # Normalización de usuarios
│ ├── vehicle.model.js     # Normalización de vehículos
│ ├── role.model.js        # Gestión de roles de usuario
│ ├── mfa.model.js         # Gestión de secretos MFA/TOTP
│ ├── ipAttempt.model.js   # Tracking de intentos por IP
│ └── requestLog.model.js  # Logging de requests y estadísticas
│
├── /routes # Definición de rutas HTTP
│ ├── auth.routes.js       # Rutas para login/register + MFA + auditoría
│ ├── vehicles.routes.js   # Rutas CRUD para vehículos con control de roles
│ └── users.routes.js      # Gestión de usuarios (solo super-admin)
│
└── /services # Lógica de negocio
├── auth.service.js        # Autenticación: BASIC, HASH, Google, JWT con MFA
├── vehicles.service.js    # CRUD de vehículos con validación de placa y soft delete
├── mfa.service.js         # Servicio MFA: generación TOTP, QR codes, verificación
└── audit.service.js       # Servicio de auditoría: estadísticas y métricas
│
├── main.js # Punto de entrada principal del servidor (puerto 5000)
├── .env                   # Variables de entorno (MySQL, JWT, etc.)
├── package.json           # Configuración de dependencias y scripts
└── package-lock.json      # Versión bloqueada de dependencias

/database -> Archivos de base de datos
├── database.sql           # Script con la creación de tablas
├── README.md              # Explicación de cada tabla y campo
└── er.png                 # Diagrama entidad-relación

```


---

## 🗄️ Base de Datos
La carpeta [`/database`](./database) contiene todo lo relacionado a la definición y documentación de la base de datos:

- **database.sql** → Script con la creación de todas las tablas incluyendo las nuevas funcionalidades
- **README.md** → Explicación breve de cada campo de cada tabla y las relaciones principales  
- **er.png** → Diagrama entidad-relación (ERD) para visualizar la estructura de forma gráfica

### **Nuevas Tablas Implementadas:**
- **roles** → Sistema de roles (VISITOR, ADMIN, SUPER_ADMIN)
- **mfa_secrets** → Secretos TOTP para autenticación multi-factor
- **ip_attempts** → Tracking de intentos por IP para Anti-Brute Force
- **request_logs** → Logging completo de requests para auditoría

---

## ⚙️ Backend

El backend está desarrollado en **Node.js** con **Express**, estructurado en capas para mantener un código limpio y escalable:

- **config/** → Conexión a MySQL.  
- **middleware/** → Validación de parámetros.  
- **routes/** → Endpoints de la API.  
- **models/** → Transformación de datos de la DB.  
- **services/** → Lógica de negocio (auth, inventario).  
- **data/** → Queries SQL a la DB.  

---

## 🔑 Endpoints de Autenticación

### Registro de usuario (texto plano)
`POST /api/auth/register/basic`
```json
{
  "username": "juan",
  "email": "juan@example.com",
  "password": "123456"
}
```

#### Login básico (texto plano)

`POST /api/auth/login/basic`
```json
{
  "username": "juan",
  "password": "123456"
}
```

#### Registro de usuario con hash
`POST /api/auth/register/hash`
```json
{
  "username": "maria",
  "email": "maria@example.com",
  "password": "secreto",
  "algo": "bcrypt"
}
```

#### Login con hash (bcrypt, MD5, SHA-256)

`POST /api/auth/login/hash`
```json
{
  "username": "maria",
  "password": "secreto"
}
```

#### Login con Google
`POST /api/auth/login/google`
```json
{
  "idToken": "TOKEN_DE_GOOGLE"
}
```

#### 🔐 Respuesta de login exitosa

```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 🚗 Endpoints de Inventario de Vehículos

#### Crear vehículo

`POST /api/vehicles`

```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "plate": "P123ABC",
  "yearMade": 2021,
  "price": 120000,
  "status": "DISPONIBLE",
  "mileageKm": 15000,
  "color": "Gris"
}
```

#### Listar vehículos

`GET /api/vehicles?brand=&status=&yearFrom=&yearTo=&includeInactive=0&page=1&pageSize=10`

#### Buscar vehículo por ID

`GET /api/vehicles/1`

Por defecto solo activos.
Si necesitas incluir inactivos:

`GET /api/vehicles/1?includeInactive=1`

#### Actualizar vehículo

`PATCH /api/vehicles/1`

```json
{
  "price": 115000,
  "status": "VENDIDO",
  "plate": "P123XYZ"
}
```

#### Deshabilitar vehículo

`POST /api/vehicles/1/disable`

(soft delete → is_active = 0)

#### Habilitar vehículo

`POST /api/vehicles/1/enable`

(reactiva el registro → is_active = 1)

## ▶️ Ejecución

1. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```
2. Configurar .env con los datos de conexión MySQL:
   ```bash
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=123456
   DB_NAME=auditoria
   JWT_SECRET=super_secret_key
   JWT_EXPIRES=1h
   ```
3. Ejecutar el servidor:
   ```bash
   npm start
   ```

---

## 🛡️ Funcionalidades Avanzadas de Seguridad

### **👥 Sistema de Roles**

El sistema implementa tres niveles de acceso:

- **🔍 VISITOR**: Solo lectura del catálogo público de vehículos
- **⚙️ ADMIN**: CRUD completo del inventario automotriz con soft delete
- **🔐 SUPER_ADMIN**: Gestión completa de usuarios + dashboard de auditoría + todos los privilegios de admin

### **🔐 Autenticación Multi-Factor (MFA)**

Implementación TOTP (Time-based One-Time Password) compatible con:
- Google Authenticator
- Authy
- Microsoft Authenticator

#### Configurar MFA:
1. **Setup**: `POST /api/auth/mfa/setup` - Genera QR code
2. **Enable**: `POST /api/auth/mfa/enable` - Activa MFA con código TOTP
3. **Login**: Incluir `totp_code` en requests de login

```json
{
  "username": "usuario",
  "password": "contraseña",
  "totp_code": "123456"
}
```

### **🚫 Protección Anti-Brute Force**

Sistema de **Exponential Backoff** por IP con límites escalonados:

- **3-4 intentos**: 30 segundos de bloqueo
- **5-9 intentos**: 1 minuto de bloqueo  
- **10-19 intentos**: 5 minutos de bloqueo
- **20+ intentos**: 15 minutos de bloqueo

### **📊 Sistema de Auditoría y Logging**

Registro automático de:
- ✅ Todos los requests por endpoint
- 🔑 Logs detallados de autenticación (exitosos y fallidos)
- 🌐 Tracking de IPs sospechosas
- 📈 Métricas en tiempo real

### **🔑 JWT Mejorado**

- **Expiración**: 2 minutos (configurable para producción)
- **Claims personalizados**: `user_id`, `username`, `role`, `role_id`, `iss`, `aud`
- **Validación estricta** de emisor y audiencia

---

## 🔗 Nuevos Endpoints

### **🔐 MFA (Multi-Factor Authentication)**

```bash
POST /api/auth/mfa/setup      # Generar configuración MFA + QR code
POST /api/auth/mfa/enable     # Habilitar MFA (requiere código TOTP)
POST /api/auth/mfa/disable    # Deshabilitar MFA
GET  /api/auth/mfa/status     # Estado MFA del usuario
```

### **📊 Dashboard de Auditoría (Solo Super-Admin)**

```bash
GET /api/auth/audit/stats               # Estadísticas generales del sistema
GET /api/auth/audit/auth-logs           # Logs de autenticación recientes
GET /api/auth/audit/suspicious-ips      # IPs con comportamiento sospechoso
GET /api/auth/audit/user-activity       # Actividad detallada por usuario
GET /api/auth/audit/endpoint-stats      # Estadísticas por endpoint
GET /api/auth/audit/hourly-trends       # Tendencias horarias del sistema
```

### **👥 Gestión de Usuarios (Solo Super-Admin)**

```bash
GET    /api/users              # Listar todos los usuarios con roles
GET    /api/users/:id          # Obtener usuario específico
PATCH  /api/users/:id/role     # Actualizar rol de usuario
GET    /api/users/roles/list   # Listar todos los roles disponibles
```

---

## 🛠️ Configuración Avanzada

### **Variables de Entorno Adicionales**

```bash
# Configuración JWT
JWT_SECRET=super_secret_key_for_production
JWT_EXPIRES=2m  # 2 minutos para demos, usar valores mayores en producción

# Configuración MFA (opcional)
MFA_ISSUER=Auditoria_System
MFA_SERVICE_NAME=Auditoria_App
```

### **Crear Usuario Super-Admin**

```sql
-- Insertar usuario super-admin para pruebas
INSERT INTO users (username, email, role_id) VALUES ('admin', 'admin@test.com', 3);
INSERT INTO auth_credentials (user_id, method, password) 
VALUES (1, 'BASIC', 'admin123');
```

### **Probar Anti-Brute Force**

```bash
# Script para simular múltiples intentos fallidos
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login/basic \
    -H "Content-Type: application/json" \
    -d '{"username":"invalid","password":"wrong"}'
done
```

---

## 📈 Dependencias Adicionales

```json
{
  "speakeasy": "^2.0.0",    // Generación y verificación TOTP
  "qrcode": "^1.5.3"        // Generación de códigos QR para MFA
}
```

---

## 🚀 Casos de Uso

### **Para Visitantes**
- Ver catálogo público de vehículos disponibles
- Buscar y filtrar vehículos activos

### **Para Administradores**  
- Gestión completa del inventario (crear, actualizar, soft delete)
- Acceso a vehículos inactivos
- Configuración personal de MFA

### **Para Super-Administradores**
- Todo lo anterior +
- Gestión de usuarios y roles
- Dashboard completo de auditoría
- Análisis de IPs sospechosas
- Métricas y tendencias del sistema

---

## 🔮 Preparación para Machine Learning

El sistema genera logs detallados optimizados para futuro análisis con ML:
- Patrones de uso por IP
- Comportamientos anómalos de usuarios
- Detección automática de intentos de ataque
- Métricas temporales para análisis predictivo

