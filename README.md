# 🛡️ Sistema de Autenticación con Arquitectura Cliente-Servidor

Este proyecto implementa un sistema de autenticación con diferentes métodos de seguridad, bajo un modelo **Cliente-Servidor**, simulando vulnerabilidades y técnicas de protección en un contexto de **gestión de inventario automotriz**.

---

## 🎯 Objetivo
Desarrollar un sistema que permita:
- Autenticación básica (usuario/contraseña en texto plano, solo con fines académicos).
- Autenticación con contraseñas cifradas (MD5, SHA-256, bcrypt).
- Login con Google (OAuth 2.0).
- Registro de intentos de inicio de sesión.
- Gestión de inventario de vehículos (CRUD con validación de placa y habilitar/deshabilitar autos).

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
│ └── validate.js          # Validación de parámetros requeridos en requests
│
├── /models # Modelos para transformar y tipar datos
│ ├── credential.model.js  # Normalización de credenciales
│ ├── oauth.model.js       # Normalización de datos de login con Google
│ ├── user.model.js        # Normalización de usuarios
│ └── vehicle.model.js     # Normalización de vehículos
│
├── /routes # Definición de rutas HTTP
│ ├── auth.routes.js       # Rutas para login/register
│ └── vehicles.routes.js   # Rutas CRUD para vehículos
│
└── /services # Lógica de negocio
├── auth.service.js        # Autenticación: BASIC, HASH, Google, JWT
└── vehicles.service.js    # CRUD de vehículos con validación de placa y soft delete
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

- **database.sql** → Script con la creación de las tablas (usuarios, credenciales, auditoría, OAuth y vehículos).  
- **README.md** → Explicación breve de cada campo de cada tabla y las relaciones principales.  
- **er.png** → Diagrama entidad-relación (ERD) para visualizar la estructura de forma gráfica.  

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

