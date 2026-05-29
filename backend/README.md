# Backend – EcoRutas

API REST central del proyecto. Se encarga de autenticación, gestión de usuarios, vehículos, rutas y asignaciones. También sincroniza datos con la API externa del profesor.

---

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL 16 con la extensión PostGIS instalada
- Archivo `.env` configurado (ver más abajo)

---

## Instalación

```bash
npm install
```

---

## Configurar el .env

Copia `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Luego rellena cada variable:

```
PORT=3000                  # Puerto donde va a correr el servidor

DB_HOST=localhost          # Host de la base de datos
DB_PORT=5432               # Puerto de PostgreSQL (por defecto 5432)
DB_USER=                   # Usuario de PostgreSQL
DB_PASSWORD=               # Contraseña del usuario
DB_NAME=ecorrutas_db       # Nombre de la base de datos

JWT_SECRET=                # Clave secreta para firmar los tokens JWT

EXTERNAL_API_URL=https://apirecoleccion.gonzaloandreslucio.com  # URL de la API del profesor
```

---

## Aplicar el schema de la base de datos

Desde la raíz del repositorio (no desde backend/):

```bash
psql -U tu_usuario -d ecorrutas_db -f docs/schema.sql
```

Esto crea todas las tablas y también crea el usuario admin por defecto con contraseña `admin123`.

---

## Correr el servidor

```bash
node server.js
```

Si todo está bien verás en consola:
```
Conexión a la base de datos exitosa
Servidor corriendo en el puerto 3000
```

---

## Probar con Insomnia

Primero hay que obtener el token. Hacer un POST a:

```
POST http://localhost:3000/api/auth/login
```

Body JSON:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

La respuesta incluye un campo `token`. Ese valor se usa como **Bearer Token** en el header `Authorization` de todas las demás peticiones. En Insomnia se configura en la pestaña Auth → Bearer Token.

---

## Endpoints disponibles

### Auth
```
POST   /api/auth/login
```

### Usuarios
```
GET    /api/usuarios            (admin)
GET    /api/usuarios/:id        (auth)
POST   /api/usuarios            (admin)
PUT    /api/usuarios/:id        (admin)
DELETE /api/usuarios/:id        (admin – desactiva, no borra)
```

### Vehículos
```
GET    /api/vehiculos           (auth)
GET    /api/vehiculos/:id       (auth)
POST   /api/vehiculos           (admin)
PUT    /api/vehiculos/:id       (admin)
DELETE /api/vehiculos/:id       (admin – cambia estado a inactivo)
```

### Rutas
```
GET    /api/rutas               (auth – solo rutas activas)
GET    /api/rutas/:id           (auth)
POST   /api/rutas               (admin)
PUT    /api/rutas/:id           (admin)
DELETE /api/rutas/:id           (admin – desactiva)
```

### Asignaciones
```
GET    /api/asignaciones                         (admin)
GET    /api/asignaciones/:id                     (auth)
GET    /api/asignaciones/conductor/:conductorId  (auth – solo las de hoy)
PATCH  /api/asignaciones/:id/estado              (admin)
```

### Recorridos
```
GET    /api/recorridos/activos-publico           (Público – para ciudadanos)
GET    /api/recorridos/activo                    (Conductor – su ruta actual)
POST   /api/recorridos/iniciar                   (Conductor)
POST   /api/recorridos/:id/finalizar             (Conductor)
POST   /api/recorridos/:id/posiciones            (Conductor)
```

### Reportes de Foto
```
GET    /api/reportes                             (admin – ver todas las fotos)
GET    /api/reportes/recorrido/:recorridoId      (auth – fotos de un viaje)
POST   /api/reportes                             (Conductor – subir foto base64)
```

### Dashboard
```
GET    /api/dashboard/metricas                   (admin – estadísticas generales)
```

---

## Despliegue en VPS

El servidor está configurado en un VPS Linux usando **PM2** para la gestión de procesos.

### Flujo de actualización:

1. Entrar al servidor vía SSH.
2. Navegar a la carpeta del proyecto: `cd ~/git-y-hub/Eco-Rutas/backend`.
3. Actualizar el código:
   ```bash
   git pull origin main
   ```
4. Reiniciar el servicio con PM2:
   ```bash
   pm2 restart server
   ```
5. Ver logs en tiempo real (opcional):
   ```bash
   pm2 logs server
   ```

---

## Estructura de carpetas

```
backend/
├── server.js               Entrada principal. Carga el .env e inicia el servidor.
├── src/
│   ├── app.js              Configura Express: middlewares, rutas y manejo de errores.
│   ├── config/
│   │   └── database.js     Conecta a PostgreSQL usando pg.Pool.
│   ├── middleware/
│   │   ├── auth.js         Verifica el JWT en cada petición protegida.
│   │   ├── roles.js        Restringe rutas según el rol del usuario.
│   │   └── errorHandler.js Captura y formatea todos los errores de la API.
│   ├── modules/            Un módulo por entidad (auth, usuarios, vehiculos, rutas, asignaciones).
│   │   └── [modulo]/
│   │       ├── [modulo].service.js     Lógica de negocio y consultas a la BD.
│   │       ├── [modulo].controller.js  Recibe la petición y llama al servicio.
│   │       └── [modulo].routes.js      Define las rutas y aplica los middlewares.
│   └── services/
│       └── externalApiService.js  Envía datos a la API externa del profesor.
```
