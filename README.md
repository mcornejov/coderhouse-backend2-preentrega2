# Café Aurora · Plataforma de Eventos e Inscripciones

Proyecto de **Backend II** de CoderHouse: una API REST con Express organizada por capas y
persistencia en MongoDB, que crece entrega a entrega hacia una plataforma completa de eventos
con autenticación, roles, inscripciones y control de cupos.

**Pre-entrega 2:** registro seguro de usuarios (`POST /api/sessions/register`) con validaciones,
normalización de email, control de duplicados y contraseñas hasheadas con bcrypt.

## Temática elegida

**Café Aurora** es una cafetería de especialidad (marca que acompaña todos mis proyectos de la
carrera Fullstack) que organiza eventos para su comunidad: catas de café, talleres de barismo,
charlas con productores y noches de música en vivo. La plataforma permitirá publicar esos eventos
y gestionar las inscripciones de los clientes.

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| Node.js (>= 20.19) | Entorno de ejecución, módulos ESM |
| Express 5 | Servidor HTTP y enrutamiento |
| MongoDB + Mongoose | Persistencia y modelos (`User`, `Event`) |
| bcrypt | Hash de contraseñas |
| dotenv | Variables de entorno |
| node:test + supertest + mongodb-memory-server | Tests de integración con base en memoria |
| pnpm | Gestor de paquetes |

## Instalación

```bash
git clone https://github.com/mcornejov/coderhouse-backend2-preentrega2.git
cd coderhouse-backend2-preentrega2
pnpm install
```

> Si no usas pnpm, `npm install` también funciona.

## Configuración de variables de entorno

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `PORT` | Puerto donde escucha el servidor | Sí |
| `NODE_ENV` | Entorno: `development`, `production` o `test` | Sí |
| `MONGO_URL` | Cadena de conexión a MongoDB (Atlas o local). Sin ella el servidor no arranca | Sí |
| `JWT_SECRET` | Secreto para firmar tokens JWT (se usará en el login) | No, por ahora |
| `BCRYPT_SALT_ROUNDS` | Costo del hash de bcrypt (por defecto 10) | No |

El archivo `.env` está excluido del repositorio mediante `.gitignore`; nunca se versionan
credenciales.

## Cómo ejecutar

```bash
pnpm start      # producción: node src/server.js
pnpm dev        # desarrollo: reinicia automáticamente al guardar cambios
pnpm test       # suite de tests (usa MongoDB en memoria, no necesita base instalada)
```

Con la configuración por defecto el servidor queda disponible en `http://localhost:8080`.

## Rutas disponibles

| Método | Ruta | Descripción | Respuesta |
|--------|------|-------------|-----------|
| GET | `/api/health` | Estado del servidor | `200` `{ "status": "ok", "message": "Servidor activo" }` |
| GET | `/api/events` | Lista de eventos (vacía por ahora) | `200` `{ "status": "success", "payload": [] }` |
| GET | `/api/events/:eid` | Detalle de un evento | `200` con el evento, o `404` si no existe |
| **POST** | **`/api/sessions/register`** | **Registro de usuario** | `201` con el usuario creado (ver abajo) |
| POST | `/api/sessions/login` | Inicio de sesión | `501` hasta implementar la autenticación |
| GET | `/api/sessions/current` | Usuario autenticado actual | `501` hasta implementar la autenticación |
| POST | `/api/sessions/logout` | Cierre de sesión | `501` hasta implementar la autenticación |

Formato de respuesta: éxito `{ "status": "success", "payload": ... }`; error
`{ "status": "error", "message": "..." }`.

## Registro de usuarios: `POST /api/sessions/register`

### Campos que espera (body JSON)

| Campo | Tipo | Reglas |
|-------|------|--------|
| `first_name` | string | Obligatorio |
| `last_name` | string | Obligatorio |
| `email` | string | Obligatorio, formato válido, único. Se normaliza con `trim` + minúsculas |
| `password` | string | Obligatoria, mínimo 8 caracteres. Se guarda hasheada con bcrypt |

El campo `role` **no se acepta desde el body**: todo usuario nuevo se crea con el rol `user`
(principio de menor privilegio). Los roles posibles son `user`, `organizer` y `admin`.

### Respuestas

| Código | Cuándo | Cuerpo |
|--------|--------|--------|
| `201` | Registro exitoso | `{ "status": "success", "payload": { "id", "first_name", "last_name", "email", "role" } }` |
| `400` | Faltan campos obligatorios | `{ "status": "error", "message": "Faltan campos obligatorios" }` |
| `400` | Email con formato inválido | `{ "status": "error", "message": "El email no tiene un formato válido" }` |
| `400` | Contraseña menor a 8 caracteres | `{ "status": "error", "message": "La contraseña debe tener al menos 8 caracteres" }` |
| `409` | Email ya registrado | `{ "status": "error", "message": "El email ya está registrado" }` |

La respuesta **nunca incluye la contraseña**, ni en texto plano ni hasheada.

### Cómo probarlo

Registro exitoso (el email llega con mayúsculas y espacios, y se guarda normalizado):

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "Ana", "last_name": "Pérez", "email": "Ana@Mail.com ", "password": "Secreta123" }'
```

```json
{ "status": "success", "payload": { "id": "665f2a...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" } }
```

Campos faltantes:

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{ "email": "ana@mail.com", "password": "Secreta123" }'
# { "status": "error", "message": "Faltan campos obligatorios" }
```

Email inválido:

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "Ana", "last_name": "Pérez", "email": "correo-invalido", "password": "Secreta123" }'
# { "status": "error", "message": "El email no tiene un formato válido" }
```

Email ya registrado (repetir el primer comando):

```bash
# { "status": "error", "message": "El email ya está registrado" }
```

### Verificar que la contraseña no está en texto plano

En MongoDB Compass o `mongosh`, el documento guardado se ve así:

```js
db.users.findOne({ email: "ana@mail.com" })
// {
//   _id: ObjectId("665f2a..."),
//   first_name: "Ana",
//   last_name: "Pérez",
//   email: "ana@mail.com",
//   password: "$2b$10$W3h1...",   ← hash de bcrypt, no "Secreta123"
//   role: "user",
//   createdAt: ..., updatedAt: ...
// }
```

La suite de tests automatiza estas seis comprobaciones (registro exitoso, campos faltantes,
email inválido, email duplicado, contraseña hasheada en la base y respuesta sin contraseña):

```bash
pnpm test
```

## Estructura de carpetas

```
coderhouse-backend2-preentrega2/
├── src/
│   ├── app.js                        # configura Express (middlewares y routers); no levanta el server
│   ├── server.js                     # punto de entrada: conecta MongoDB y levanta el servidor
│   ├── config/
│   │   ├── env.config.js             # carga y valida variables de entorno (Fail-Fast)
│   │   └── db.config.js              # conexión a MongoDB con Mongoose
│   ├── routes/
│   │   ├── index.js                  # router principal: monta los recursos bajo /api
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js        # compone la cadena de capas del registro
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js    # extrae el body y responde 201 / errores
│   ├── services/
│   │   ├── events.service.js
│   │   └── sessions.service.js       # validaciones, normalización, unicidad, hash
│   ├── repositories/
│   │   ├── events.repository.js
│   │   └── users.repository.js       # acceso a datos; devuelve DTOs sin contraseña
│   ├── dao/
│   │   ├── events.dao.js
│   │   └── users.dao.js              # única capa que usa el modelo User de Mongoose
│   ├── dto/
│   │   └── user.dto.js               # qué campos del usuario se exponen al cliente
│   ├── models/
│   │   ├── User.js                   # first_name, last_name, email (único), password, role
│   │   └── Event.js
│   ├── middlewares/
│   │   ├── notFound.middleware.js
│   │   └── error.middleware.js       # traduce errores a 400 / 404 / 409 / 500
│   └── utils/
│       ├── hash.js                   # hashPassword / comparePassword con bcrypt (reutilizable)
│       ├── validators.js             # isValidEmail, normalizeEmail, largo mínimo de contraseña
│       ├── errors.util.js            # HttpError, BadRequestError, NotFoundError, ConflictError
│       └── responses.util.js         # helpers de respuesta uniforme
├── test/
│   ├── setup.js                      # MongoDB en memoria para los tests
│   ├── api.test.js
│   └── register.test.js
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### Flujo del registro

```
POST /api/sessions/register
  → sessions.router      mapea la ruta al controlador
  → sessions.controller  toma req.body y responde 201 o delega el error al middleware
  → sessions.service     valida campos, formato y largo; normaliza el email; verifica duplicados;
                         hashea con utils/hash.js; arma el usuario con whitelist de campos (sin role)
  → users.repository     persiste vía DAO y devuelve el DTO sin contraseña
  → users.dao            User.create / User.findOne con Mongoose
  → models/User.js       esquema con email único y role por defecto "user"
```

## Modelos

- **User**: `first_name`, `last_name`, `email` (único, minúsculas), `password` (hash de bcrypt),
  `role` (`user` por defecto | `organizer` | `admin`), timestamps.
- **Event**: `title`, `description`, `date`, `location`, `capacity`, `price`, `status`,
  `organizer` (referencia a `User`).

## Próximos pasos

Login con validación de contraseña (`comparePassword`), JWT y cookies, ruta `current`, Passport,
autorización por roles, CRUD completo de eventos e inscripciones con control de cupos.
