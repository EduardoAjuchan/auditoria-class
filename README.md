# 🛡️ Sistema de Autenticación con Arquitectura Cliente-Servidor

Este proyecto implementa un sistema de autenticación con diferentes métodos de seguridad, bajo un modelo **Cliente-Servidor**, simulando vulnerabilidades y técnicas de protección en un contexto de **gestión de inventario automotriz**.

---

## 🎯 Objetivo
Desarrollar un sistema que permita:
- Autenticación básica (usuario/contraseña en texto plano, solo con fines académicos).
- Autenticación con contraseñas cifradas (MD5, SHA-256, bcrypt).
- Login con Google (OAuth 2.0).
- Registro de intentos de inicio de sesión.
- Gestión de inventario de vehículos (listar autos con datos principales).

---

## 🏗️ Arquitectura
- **Frontend:** Cliente que consume los servicios del backend.
- **Backend:** Servidor en **Node.js**.
- **Comunicación:** HTTP/HTTPS.
- **Base de datos:** Oracle (ejecutada en Docker).
- **Modelo:** Arquitectura Cliente-Servidor.

---
# 🛡️ Sistema de Autenticación con Arquitectura Cliente-Servidor

Este proyecto implementa un sistema de autenticación con diferentes métodos de seguridad, bajo un modelo **Cliente-Servidor**, simulando vulnerabilidades y técnicas de protección en un contexto de **gestión de inventario automotriz**.

---

## 🎯 Objetivo
Desarrollar un sistema que permita:
- Autenticación básica (usuario/contraseña en texto plano, solo con fines académicos).
- Autenticación con contraseñas cifradas (MD5, SHA-256, bcrypt).
- Login con Google (OAuth 2.0).
- Registro de intentos de inicio de sesión.
- Gestión de inventario de vehículos (listar autos con datos principales).

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
/database -> Archivos de base de datos
├── database.sql             # Script con la creación de tablas
├── README.md                # Explicación de cada tabla y campo
└── er.png                   # Diagrama entidad-relación

/backend -> Código fuente del servidor en Node.js
├── /config                  # Configuración general
│   └── db.js                # Conexión a la base de datos MySQL mediante mysql2 (pool)
│
├── /data                    # Consultas SQL a la base de datos
│   └── auth.data.js         # Queries para usuarios, credenciales, OAuth y auditoría de login
│
├── /middleware              # Middlewares de Express
│   └── validate.js          # Validación de parámetros requeridos en requests (ej. body obligatorio)
│
├── /models                  # Modelos para transformar y tipar datos
│   ├── credential.model.js  # Normalización de credenciales (BASIC / HASH)
│   ├── oauth.model.js       # Normalización de datos de login con Google
│   └── user.model.js        # Normalización de usuarios (id, username, email, fechas)
│
├── /routes                  # Definición de rutas HTTP
│   └── auth.routes.js       # Rutas para login/register (basic, hash, Google)
│
└── /services                # Lógica de negocio
│   └── auth.service.js      # Reglas de autenticación: manejo de credenciales, hash, Google OAuth, JWT
│
├── main.js                  # Punto de entrada principal del servidor Express (puerto 5000)
├── .env                     # Variables de entorno (conexión a MySQL, JWT, etc.)
├── package.json             # Configuración de dependencias y scripts de Node.js
└── package-lock.json        # Versión bloqueada de dependencias
```

---

## 🗄️ Base de Datos
La carpeta [`/database`](./database) contiene todo lo relacionado a la definición y documentación de la base de datos:

- **database.sql** → Script con la creación de las tablas (usuarios, credenciales, auditoría, OAuth y vehículos).  
- **README.md** → Explicación breve de cada campo de cada tabla y las relaciones principales.  
- **er.png** → Diagrama entidad-relación (ERD) para visualizar la estructura de forma gráfica.  

---

## ⚙️ Backend

El backend está desarrollado en **Node.js** con **Express**, estructurado en capas para mantener un código limpio y escalable:

- **config/** → Configuración de la conexión a MySQL.  
- **middleware/** → Validación de parámetros de entrada (ej: campos requeridos).  
- **routes/** → Rutas disponibles de la API.  
- **models/** → Modelos para transformar y tipar datos provenientes de la DB.  
- **services/** → Lógica de negocio (autenticación, validaciones, emisión de JWT).  
- **data/** → Consultas SQL hacia la base de datos usando `mysql2`.  

### 🔑 Endpoints disponibles

#### Registro de usuario (texto plano)
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

