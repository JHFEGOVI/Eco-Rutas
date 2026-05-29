# Eco-Rutas

Sistema para optimizar la recolección de residuos en Buenaventura, Colombia.

---

## Por qué existe esto

Este proyecto nació como trabajo integrador de tres materias universitarias. La idea surgió de un problema real: Buenaventura tiene serias deficiencias en el servicio de recolección de basuras, y parte del problema es la falta de información en tiempo real sobre rutas y vehículos.

Eco-Rutas intenta resolver eso dándole a los administradores una herramienta para gestionar rutas y conductores, y a los ciudadanos una forma de saber cuándo pasa el camión por su zona.

---

## Cómo está organizado el repositorio

```
Eco-Rutas/
├── backend/        API REST en Node.js + Express. Gestiona usuarios, vehículos, rutas, asignaciones y recorridos.
├── web-admin/      Panel de administración en Angular. Desde aquí se crean rutas, asignan conductores, etc.
├── app-conductor/  App móvil en Ionic para los conductores. Registra el recorrido en tiempo real.
├── app-ciudadano/  App móvil en Ionic para los ciudadanos. Muestra el mapa con la ruta activa.
└── docs/           Esquema de la base de datos y documentación general del proyecto.
```

---

## Tecnologías

- **Backend:** Node.js + Express, PostgreSQL con PostGIS para geometría
- **Web admin:** Angular
- **Apps móviles:** Ionic + Capacitor (Android/iOS)

---

## Estado actual

El **Backend** está completo y desplegado en producción. Gestiona autenticación JWT, CRUD geoespacial con PostGIS, asignaciones y la doble persistencia con la API externa.

El **Panel Web (Admin)** está desplegado y operativo para la gestión de rutas y reportes.

Las **Apps móviles** (Conductor y Ciudadano) han sido generadas como APKs para pruebas en dispositivos Android.

- **Dominio de producción:** `https://srv1564743.hstgr.cloud`
- **Web Admin:** [srv1564743.hstgr.cloud](https://srv1564743.hstgr.cloud)

---

## Endpoints Principales (Producción)

Toda la API está bajo el prefijo `/api`.

- `POST /auth/login` - Autenticación.
- `GET  /recorridos/activos-publico` - Listado público para la app ciudadano (sin token).
- `POST /recorridos/iniciar` - Inicio de ruta (conductor).
- `POST /reportes` - Envío de fotos de reporte con base64.
- `GET  /dashboard/metricas` - Resumen para el panel administrativo.

---

## Doble persistencia

El sistema guarda los datos en su propia base de datos PostgreSQL y también los replica en una API externa del profesor del curso. Esto permite que el backend funcione de forma independiente, pero al mismo tiempo se integra con la plataforma que el profesor usa para evaluar el proyecto. Si la API externa falla, el sistema sigue funcionando sin interrupciones.

---

## Repositorio

[github.com/JHFEGOVI/Eco-Rutas](https://github.com/JHFEGOVI/Eco-Rutas)
