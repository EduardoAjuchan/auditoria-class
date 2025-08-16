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

## 📂 Estructura del Proyecto

```
/database -> Archivos de base de datos
├── database.sql    # Script con la creación de tablas
├── README.md       # Explicación de cada tabla y campo
└── er.png          # Diagrama entidad-relación
``` 

## 🗄️ Base de Datos
La carpeta [`/database`](./database) contiene todo lo relacionado a la definición y documentación de la base de datos:

- **database.sql** → Script con la creación de las tablas (usuarios, credenciales, auditoría, OAuth y vehículos).  
- **README.md** → Explicación breve de cada campo de cada tabla y las relaciones principales.  
- **er.png** → Diagrama entidad-relación (ERD) para visualizar la estructura de forma gráfica.  

---