# Base de Datos - Sistema de Autenticación e Inventario Automotriz

Este módulo contiene la definición de la base de datos en Oracle (Docker) para el proyecto.

## 📌 Objetivo
Gestionar la autenticación de usuarios mediante diferentes métodos y administrar un inventario de vehículos.

## 📂 Archivos
- `database.sql` → Script principal con las tablas, claves primarias y foráneas.
- `README.md`    → Explicación de la base de datos
  
## 🗄️ Tablas y campos

### 1. USERS
Usuarios registrados en el sistema.

| Campo       | Tipo          | Descripción                                     |
|-------------|---------------|-------------------------------------------------|
| `USER_ID`   | NUMBER (PK)   | Identificador único del usuario (autogenerado). |
| `USERNAME`  | VARCHAR2(50)  | Nombre de usuario único para login.             |
| `EMAIL`     | VARCHAR2(120) | Correo electrónico único.                       |
| `CREATED_AT`| TIMESTAMP     | Fecha y hora de creación del usuario.           |

---

### 2. AUTH_CREDENTIALS
Credenciales asociadas a cada usuario para autenticación básica o con hash.

| Campo       | Tipo          | Descripción                                                           |
|-------------|---------------|-----------------------------------------------------------------------|
| `CRED_ID`   | NUMBER (PK)   | Identificador único de la credencial (autogenerado).                  |
| `USER_ID`   | NUMBER (FK)   | Relación con el usuario dueño de la credencial.                       |
| `METHOD`    | VARCHAR2(20)  | Tipo de método: `BASIC` (texto plano, demo) o `HASH`.                 |
| `PASSWORD`  | VARCHAR2(256) | Contraseña en texto plano (solo simulación) o en formato hash seguro. |
| `CREATED_AT`| TIMESTAMP     | Fecha en que se creó la credencial.                                   |

---

### 3. OAUTH_ACCOUNT
Información de cuentas externas para login con Google.

| Campo              | Tipo          | Descripción                             |
|--------------------|---------------|-----------------------------------------|
| `OAUTH_ID`         | NUMBER (PK)   | Identificador único de la cuenta OAuth. |
| `USER_ID`          | NUMBER (FK)   | Relación con el usuario asociado.       |
| `PROVIDER_USER_ID` | VARCHAR2(128) | ID único asignado por Google (sub).     |
| `EMAIL`            | VARCHAR2(120) | Correo registrado en Google.            |
| `CREATED_AT`       | TIMESTAMP     | Fecha en que se vinculó la cuenta.      |

---

### 4. LOGIN_AUDIT
Bitácora de intentos de inicio de sesión.

| Campo       | Tipo         | Descripción                                                       |
|-------------|--------------|-------------------------------------------------------------------|
| `LOGIN_ID`  | NUMBER (PK)  | Identificador del intento de login (autogenerado).                |
| `USER_ID`   | NUMBER (FK)  | Usuario que intentó iniciar sesión (puede ser NULL si no existe). |
| `METHOD`    | VARCHAR2(20) | Método usado: `BASIC`, `HASH`, `GOOGLE`.                          |
| `SUCCESS`   | NUMBER(1)    | Resultado: `1` = éxito, `0` = fallo.                              |
| `CREATED_AT`| TIMESTAMP    | Fecha y hora del intento.                                         |

---

### 5. VEHICLES
Inventario de vehículos en el sistema.

| Campo       | Tipo         | Descripción                                       |
|-------------|--------------|---------------------------------------------------|
| `VEHICLE_ID`| NUMBER (PK)  | Identificador único del vehículo.                 |
| `BRAND`     | VARCHAR2(50) | Marca (Toyota, Ford, etc.).                       |
| `MODEL`     | VARCHAR2(80) | Modelo (Camry, F-150, etc.).                      |
| `YEAR_MADE` | NUMBER(4)    | Año de fabricación.                               |
| `PRICE`     | NUMBER(12,2) | Precio del vehículo.                              |
| `STATUS`    | VARCHAR2(20) | Estado: `DISPONIBLE`, `VENDIDO`, `MANTENIMIENTO`. |
| `MILEAGE_KM`| NUMBER(10)   | Kilometraje recorrido.                            |
| `COLOR`     | VARCHAR2(40) | Color del vehículo.                               |
| `CREATED_AT`| TIMESTAMP    | Fecha en que se registró el vehículo.             |

---

## 🔗 Relaciones principales
- `USERS (1) → (N) AUTH_CREDENTIALS` : un usuario puede tener credenciales en distintos métodos.  
- `USERS (1) → (N) OAUTH_ACCOUNT` : un usuario puede vincular su cuenta de Google.  
- `USERS (1) → (N) LOGIN_AUDIT` : los intentos de login se registran en la bitácora.  
- `VEHICLES` : tabla independiente, no relacionada directamente con usuarios.  

---