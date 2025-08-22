# 📘 Frontend - Auditoría Class

Este proyecto corresponde al **frontend** del sistema de autenticación y gestión de inventario automotriz, desarrollado con **Next.js 14**, **React**, **Tailwind CSS** y siguiendo un modelo de arquitectura **Cliente-Servidor**.

---

## 🚀 Tecnologías usadas

- **Next.js 14 (App Router)**
- **React 18**
- **Tailwind CSS** (estilos y componentes responsivos)
- **Lucide React** (iconos)
- **JWT en LocalStorage** (gestión de sesión)
- **Google Identity Services** (login con Google OAuth 2.0)

---

## ⚙️ Variables de entorno

Las variables de entorno se configuran en el archivo `.env` dentro de `frontend/`:

```env
# URL del backend Node (ajustar al puerto donde corre el servidor)
NEXT_PUBLIC_API_BASE=http://localhost:5050

# Client ID de Google (proyecto configurado en Google Cloud, tipo Web)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

---

## 🗂️ Estructura del proyecto

```plaintext
/frontend
├── src/app
│   ├── (protected)/dashboard/page.tsx   # Vista principal protegida (Dashboard + tabla de vehículos)
│   ├── layout.tsx                       # Layout raíz
│   ├── page.tsx                         # Página de inicio (autenticación)
│   └── middleware.ts                    # Middleware para proteger rutas
│
├── components
│   ├── auth/                            # Formularios de autenticación
│   │   ├── AuthButtons.tsx              # Botones de registro/login
│   │   ├── LoginModal.tsx               # Modal de login (básico y hash)
│   │   ├── RegisterBasicModal.tsx       # Modal para registro básico
│   │   └── RegisterHashModal.tsx        # Modal para registro con contraseñas hash
│   │
│   ├── layout/
│   │   └── NavBar.tsx                   # Barra de navegación con logout y acceso a vehículos
│   │
│   ├── ui/
│   │   ├── Modal.tsx                    # Componente genérico de modal
│   │   └── Alert.tsx                    # Componente de alertas reutilizable
│   │
│   └── vehicles/
│       ├── CreateVehicleModal.tsx       # Modal para crear y editar vehículos
│       └── VehiclesTable.tsx            # (Versión previa de la tabla, ahora integrada en el Dashboard)
│
└── .env                                 # Variables de entorno
```

---

## 🔐 Rutas protegidas

El sistema utiliza un **route group `(protected)`** en Next.js para encapsular vistas que requieren autenticación.

- **middleware.ts**:
  - Verifica la existencia del token JWT en `localStorage`.
  - Si no existe token, redirige automáticamente al inicio (`/`).
- **Dashboard**:
  - Solo accesible si hay sesión activa.
  - Al cerrar sesión, el token se elimina y cualquier intento de volver a `/dashboard` redirige a `/`.

---

## 👤 Métodos de Registro y Login

### Registro básico
- Endpoint: `POST /api/auth/register/basic`
- Guarda credenciales en texto plano (solo académico).

### Login básico
- Endpoint: `POST /api/auth/login/basic`

### Registro con Hash
- Endpoint: `POST /api/auth/register/hash`
- Algoritmos: **MD5, SHA-256, bcrypt** (seleccionable).

### Login con Hash
- Endpoint: `POST /api/auth/login/hash`

### Login con Google OAuth
- Endpoint: `POST /api/auth/login/google`
- Se usa el **id_token** generado por el SDK oficial de Google Identity.

Todos los logins exitosos devuelven un **JWT** que se almacena en `localStorage`.

---

## 📄 Vistas principales

### Página de inicio (`/`)
- Formulario con botones para elegir método de registro/login:
  - Registrar (Básico)
  - Login (Básico)
  - Registrar (Hash)
  - Login (Hash)
  - Google OAuth
- Cada opción abre su **modal correspondiente**.

### Dashboard (`/dashboard`)
- Vista protegida con **NavBar** superior.
- Tabla de vehículos que muestra:
  - Marca, Modelo, Placa, Año, Precio, Estado, Activo, Km, Color, Fecha de creación.
- Acciones disponibles en cada fila:
  - ✏️ **Editar** (abre modal en modo edición, permite cambiar placa, precio y estado).
  - 🚫 **Deshabilitar** (soft delete → `POST /api/vehicles/:id/disable`).
  - ✅ **Habilitar** (reactiva → `POST /api/vehicles/:id/enable`).

---

## 📦 Componentes clave

- **Modal.tsx**: base visual para todos los modales del sistema.
- **Alert.tsx**: alertas de éxito/error reutilizables en todos los formularios.
- **CreateVehicleModal.tsx**:
  - En modo *create*: todos los campos disponibles, estado fijo `DISPONIBLE`.
  - En modo *edit*: solo se pueden modificar `estado`, `precio`, `placa`.
- **NavBar.tsx**: contiene el nombre del sistema a la izquierda y botones de navegación a la derecha.
- **AuthButtons.tsx**: layout de botones iniciales para selección de método de autenticación.

---

## ✅ Flujo de sesión

1. El usuario se registra o inicia sesión.
2. El backend responde con `ok: true` y un `token`.
3. El token se guarda en `localStorage`.
4. Middleware asegura que solo vistas en `(protected)` pueden acceder si existe token.
5. Al cerrar sesión:
   - Se elimina el token de `localStorage`.
   - El usuario es redirigido a la pantalla de inicio.

---

## 📌 Notas finales

Este frontend está pensado para integrarse con el **backend Node.js/Express** descrito en el repositorio principal, el cual expone los endpoints para autenticación y CRUD de vehículos.  
La comunicación entre cliente y servidor se hace vía **HTTP/HTTPS** con JSON y autenticación por **Bearer Token**.


# 📘 Frontend — Auditoría Class

Frontend del sistema de **autenticación** y **gestión de inventario automotriz**. Construido con **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS** y **Google Identity Services**. Consume el backend Node.js expuesto por el repositorio principal.

---

## ⚙️ Variables de entorno
Crea un `.env` en `frontend/` con:

```env
# URL del backend Node (ajustar al puerto donde corre el servidor)
NEXT_PUBLIC_API_BASE=http://localhost:5050

# Client ID de Google (tipo Web, en Google Cloud)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

> **Nota Google OAuth**: en la consola de Google, añadí como **orígenes de JavaScript autorizados** la URL donde corre el frontend (por ejemplo `http://localhost:3000`). Si usás dominios distintos para dev y prod, registrá ambos.

---

## 🗂️ Estructura del proyecto

```plaintext
/frontend
├── src/app
│   ├── (protected)/
│   │   └── dashboard/
│   │       ├── page.tsx           # Vista principal protegida (tabla de vehículos, acciones)
│   │       └── layout.tsx         # Layout del route group protegido
│   ├── layout.tsx                 # Layout raíz (tipografías, tema, contenedor)
│   ├── page.tsx                   # Landing de autenticación (botones + modales)
│   └── globals.css                # Tailwind base y utilidades de estilo
│
├── components
│   ├── auth/
│   │   ├── AuthButtons.tsx        # Botonera para elegir flujo (registro/login/Google)
│   │   ├── GoogleAuthInline.tsx   # Botón Google (SDK oficial) → obtiene id_token y llama al backend
│   │   ├── LoginModal.tsx         # Modal de login (básico o hash). Muestra errores de la API
│   │   ├── RegisterBasicModal.tsx # Modal: registro básico (texto plano; fines académicos)
│   │   └── RegisterHashModal.tsx  # Modal: registro con hash (MD5/SHA-256/bcrypt)
│   │
│   ├── layout/
│   │   └── NavBar.tsx             # Barra superior (brand izquierda, acciones derecha). Logout
│   │
│   ├── ui/
│   │   ├── Modal.tsx              # Modal genérico reutilizable (accesible, focus trap suave)
│   │   └── Alert.tsx              # Alertas de éxito/error reutilizables (estilo consistente)
│   │
│   └── vehicles/
│       ├── CreateVehicleModal.tsx # Modal creación/edición. En edición permite: estado, precio, placa
│       └── VehiclesTable.tsx      # (Histórico) tabla; hoy la tabla vive inline en Dashboard
│
├── lib/
│   ├── api.ts                     # Helper de fetch: baseURL, headers, parse de errores
│   └── auth.ts                    # Helper de sesión: getToken/setToken/clearToken/isAuthenticated
│
├── middleware.ts                  # Middleware de Next (ver sección de seguridad)
└── .env                           # Variables de entorno
```

---

## 🔐 Seguridad del lado del frontend

### 1) Persistencia y uso del token
- El backend devuelve un **JWT** en login/registro exitoso.
- El token se guarda en **`localStorage`** (clave `token`).
- Cada request al backend se envía con `Authorization: Bearer <token>`.

> **Riesgo XSS**: almacenar tokens en `localStorage` expone la sesión a XSS si alguna dependencia o código ejecuta JS inyectado. Se mitigó con:
> - UI estricta sin `dangerouslySetInnerHTML`.
> - Inputs controlados y sin render de HTML no confiable.
> - Manejo centralizado de fetch en `lib/api.ts`, sin interpolaciones peligrosas.
> 
> Endurecer a futuro: mover el token a **cookie HTTPOnly** y validar en **middleware** para protección server-side real.

### 2) Rutas protegidas
- Las vistas protegidas viven bajo **`/src/app/(protected)/...`**.
- **Guardia en cliente**: en `dashboard/page.tsx` se verifica el token con `localStorage`. Si falta, se hace `router.replace('/')` y no se renderiza contenido.
- **NavBar** implementa **logout** borrando el token y navegando con `replace` para evitar volver con Back.
- **middleware.ts**: presente para futuros entornos con cookie HTTPOnly. Recordatorio importante: 
  - El middleware corre en el edge y **no** puede leer `localStorage`.
  - Para que el middleware redirija por sí mismo, el token debería venir en **cookie**. Hoy el bloqueo efectivo es **client-side**.

### 3) Manejo de errores y UX
- `LoginModal.tsx` muestra mensajes de error **provenientes de la API** (`error`/`message`/`msg`) en lugar de códigos crudos (ej. 401).
- Todas las mutaciones (crear/editar/enable/disable) muestran alerts, deshabilitan botones mientras envían y actualizan la tabla de forma optimista más un `refetch` cuando aplica.

### 4) Autorización visual
- La tabla muestra **Estado de negocio** (`DISPONIBLE`/`VENDIDO`) y **Activo** (habilitado/inhabilitado) con badges diferenciados.
- Acciones restringidas por contexto: si está inhabilitado, se muestra **Habilitar**; si está habilitado, **Deshabilitar**.

---

## 👤 Flujos de autenticación

| Flujo | Endpoint backend | UI involucrada |
|------|-------------------|----------------|
| Registro básico | `POST /api/auth/register/basic` | `RegisterBasicModal.tsx` |
| Login básico | `POST /api/auth/login/basic` | `LoginModal.tsx` |
| Registro con hash | `POST /api/auth/register/hash` | `RegisterHashModal.tsx` |
| Login con hash | `POST /api/auth/login/hash` | `LoginModal.tsx` (toggle) |
| Login con Google | `POST /api/auth/login/google` | `GoogleAuthInline.tsx` (SDK) |

- Google usa `@react-oauth/google`. Al éxito, obtenemos **`id_token`** y lo enviamos al backend.
- Al autenticar, el token se guarda y se emite el evento `auth:login` para que la UI reaccione.

---

## 🚗 CRUD de vehículos (Dashboard)

**Ruta**: `/dashboard` (protegida)

- **Listado**: `GET /api/vehicles?brand=&status=&yearFrom=&yearTo=&includeInactive=0&page=1&pageSize=10`.
  - Paginación simple (Anterior/Siguiente).
  - Normalización de campos provenientes del backend (`vehicleId → id`, `year_made → yearMade`, etc.).
- **Crear**: `POST /api/vehicles` (estado fijo `DISPONIBLE`).
  - UI: `CreateVehicleModal.tsx` en modo *create*.
- **Editar**: `PATCH /api/vehicles/:id`.
  - UI: mismo modal en modo *edit*, **solo** permite editar: `status`, `price`, `plate`.
  - Se envía **diff** de campos cambiados cuando aplica.
- **Deshabilitar**: `POST /api/vehicles/:id/disable` (soft delete → `is_active = 0`).
- **Habilitar**: `POST /api/vehicles/:id/enable` (reactiva → `is_active = 1`).

**Acciones UI**
- Iconos consistentes (Lucide) para Editar y Habilitar/Deshabilitar.
- Badges: `VENDIDO` y `Inactivo` en rojo; `DISPONIBLE` en verde.
- Tabla responsiva por columnas (se ocultan columnas menos críticas en pantallas estrechas).

---

## 📦 Componentes clave (detalle)

### `components/auth/AuthButtons.tsx`
Botonera principal. Abre los modales de registro/login y el flujo de Google. Diseño accesible y consistente con Tailwind.

### `components/auth/GoogleAuthInline.tsx`
Renderiza botón oficial de Google (GSI). Gestiona `id_token`, llama al backend y, si es correcto, guarda `token` y navega al dashboard.

### `components/auth/LoginModal.tsx`
Soporta **login básico** y **login con hash** (mismo modal, cambia endpoint según selección). Muestra mensajes de la API. Guarda el token y redirige.

### `components/auth/RegisterBasicModal.tsx` / `RegisterHashModal.tsx`
Modales equivalentes para registrar usuario con texto plano o con hash. En hash se puede elegir algoritmo (MD5/SHA-256/bcrypt).

### `components/layout/NavBar.tsx`
Barra superior a ancho completo. A la izquierda, **Auditoría**; a la derecha, botón **Vehículos** y **Cerrar sesión**. El logout limpia el token y usa `router.replace('/')` para impedir back.

### `components/ui/Modal.tsx`
Contenedor de modal reutilizable. Fondo con blur sutil, bordes redondeados, foco y contraste adecuados.

### `components/ui/Alert.tsx`
Alertas en **success/error/info**. Reutilizadas por login y formularios de vehículos.

### `components/vehicles/CreateVehicleModal.tsx`
- **Create**: todos los campos, `status` bloqueado en `DISPONIBLE`.
- **Edit**: solo `status`, `price`, `plate`. Valida placa y números, muestra errores de la API.

---

## 🧭 Protected routing: archivos involucrados

- `src/app/(protected)/layout.tsx`: layout del grupo protegido. Aquí se ha centralizado el contenedor visual. 
- `src/app/(protected)/dashboard/page.tsx`: **guardia en cliente** (lee `localStorage` y hace `router.replace('/')` si falta token), fetch de vehículos y render de la tabla.
- `components/layout/NavBar.tsx`: control de logout (limpia token y navega con replace).
- `lib/auth.ts`:
  - `getToken()`/`setToken()`/`clearToken()`
  - `isAuthenticated()` (true si hay token válido en el cliente)
- `middleware.ts`: scaffolding para futura verificación en **Edge** cuando el token migre a cookie HTTPOnly. Hoy no lee `localStorage` (no es posible desde middleware).

> **Importante**: la seguridad real del recurso la aplica el backend con el Bearer Token. El guardado en localStorage protege la navegación UI; la autorización de datos vive en el servidor.

---

## 🛠️ Scripts y ejecución

```bash
# instalar dependencias
pnpm install  # o npm install / yarn

# desarrollo
pnpm dev      # http://localhost:3000

# build producción
pnpm build
pnpm start
```

> Asegurate de que el backend esté activo y que `NEXT_PUBLIC_API_BASE` apunte a la URL correcta.

---

## 🧪 QA y comprobaciones
- **Errores API**: se muestran al usuario con mensajes amigables.
- **Paginación**: control Anterior/Siguiente bloquea extremos.
- **Acciones**: los botones muestran estado `loading` y se deshabilitan durante requests.
- **Accesibilidad**: labels, `sr-only` en icon buttons, contraste adecuado en dark mode.

---



## 📎 Referencias
- Next.js App Router
- Google Identity Services (GSI)
- Tailwind CSS
- Lucide Icons