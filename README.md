# Sistema de Gestión de Políticas de Contraseñas Seguras

Sistema completo de gestión de contraseñas con arquitectura de microservicios, validación avanzada, autenticación JWT, comunicación gRPC y notificaciones por Telegram.

## Arquitectura

El proyecto consta de 5 componentes principales:

- **S1**: Servidor HTTPS principal (Express + JWT + TLS) - Puerto 3001
- **S2**: Servidor de validación gRPC - Puerto 50051
- **S3**: Servidor REST de datos (MongoDB) - Puerto 3003
- **Client Admin**: Panel de administración (HTML/CSS/JS)
- **Client User**: Portal de usuario (HTML/CSS/JS)

```
┌─────────────┐     ┌─────────────┐
│ Client Admin│────▶│     S1      │
└─────────────┘     │  (HTTPS)    │
                    │   + JWT     │◀───┐
┌─────────────┐     │   + TLS     │    │
│ Client User │────▶└─────────────┘    │
└─────────────┘            │           │
                           │ HTTP      │ gRPC
                           ▼           │
                    ┌─────────────┐    │
                    │     S3      │    │
                    │  (MongoDB)  │    │
                    └─────────────┘    │
                           ▲           │
                           └───────────┘
                                   ┌─────────────┐
                                   │     S2      │
                                   │   (gRPC)    │
                                   └─────────────┘
```

## Requisitos Previos

- Docker Desktop instalado
- Docker Compose
- Node.js 18+ (para desarrollo local)
- Un bot de Telegram (opcional, para notificaciones)

## Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd password-security-system
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# MongoDB
MONGO_URI=mongodb://mongo:27017/passwordsecurity

# JWT
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=tu_token_de_bot_telegram

# URLs de servicios
S3_BASE_URL=http://s3:3003
S2_GRPC_HOST=s2
S2_GRPC_PORT=50051

# TLS
TLS_CERT_PATH=/app/certs/server.crt
TLS_KEY_PATH=/app/certs/server.key

# Seguridad interna
INTERNAL_SECRET=secreto_interno_para_comunicacion_entre_servicios
```

### 3. Generar certificados TLS (autofirmados)

Para desarrollo, ejecuta el script de generación de certificados:

**Windows (PowerShell):**
```powershell
.\scripts\generate-certs.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/generate-certs.sh
./scripts/generate-certs.sh
```

O manualmente:
```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj "/CN=localhost"
```

### 4. Obtener un bot de Telegram (opcional)

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot` y sigue las instrucciones
3. Copia el token que te da
4. Actualiza `TELEGRAM_BOT_TOKEN` en el archivo `.env`
5. Para obtener tu chat ID, envía un mensaje a tu bot y visita:
   ```
   https://api.telegram.org/bot<TU_TOKEN>/getUpdates
   ```

## Ejecución con Docker

### Iniciar todos los servicios

```bash
docker-compose up --build
```

O usa el script proporcionado:

**Windows:**
```powershell
.\scripts\run-all.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/run-all.sh
./scripts/run-all.sh
```

### Detener los servicios

```bash
docker-compose down
```

### Ver logs

```bash
docker-compose logs -f
```

## Acceso a los Servicios

Una vez iniciados los servicios, accede a:

- **Cliente Admin**: https://localhost:3001/admin/ (acepta certificado autofirmado)
- **Cliente Usuario**: https://localhost:3001/user/
- **API S1 (HTTPS)**: https://localhost:3001
- **API S3 (HTTP)**: http://localhost:3003
- **MongoDB**: mongodb://localhost:27017

### Credenciales por defecto

Al iniciar, se crea un usuario admin:

- **Email**: admin@example.com
- **Password**: Admin123!@#Secure

## API Endpoints

### S1 - Servidor Principal (HTTPS)

#### Autenticación
- `POST /auth/login` - Iniciar sesión
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```

#### Usuario
- `GET /users/me/password-status` - Estado de contraseña (requiere JWT)
- `POST /users/me/change-password` - Cambiar contraseña (requiere JWT)
  ```json
  {
    "currentPassword": "old_password",
    "newPassword": "new_password"
  }
  ```

#### Admin (requiere rol admin)
- `GET /admin/users` - Listar usuarios
- `POST /admin/users` - Crear usuario
- `PUT /admin/users/:id` - Actualizar usuario
- `DELETE /admin/users/:id` - Eliminar usuario
- `GET /admin/policies` - Listar políticas
- `GET /admin/policies/active` - Política activa
- `POST /admin/policies` - Crear política

### S3 - Servidor de Datos

- `GET /health` - Estado del servicio
- `GET /users` - Listar usuarios
- `GET /users/:id` - Obtener usuario
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `GET /policies` - Listar políticas
- `GET /policies/active` - Política activa
- `POST /policies` - Crear política
- `PUT /policies/:id` - Actualizar política

### S2 - Servicio gRPC

Servicio `PasswordService`:
- `ValidatePassword` - Validar contraseña según políticas

## Validaciones de Contraseña

Las contraseñas deben cumplir:

1. ✅ Mínimo 15 caracteres
2. ✅ Al menos una mayúscula
3. ✅ Al menos una minúscula
4. ✅ Al menos un dígito
5. ✅ Al menos un símbolo especial
6. ✅ No estar en el top 1000 de contraseñas débiles
7. ✅ No ser similar a la contraseña anterior (>80% similitud)
8. ✅ No contener el email del usuario

## Seguridad

- **Hashing**: bcrypt con 12 salt rounds
- **JWT**: Tokens firmados con expiración de 1 hora
- **TLS**: Comunicación HTTPS con certificados
- **Validación**: Sistema multicapa de validación de contraseñas
- **Historial**: Las contraseñas antiguas se guardan para evitar reutilización

## Desarrollo Local

### Instalar dependencias

```bash
cd s1 && npm install
cd ../s2 && npm install
cd ../s3 && npm install
```

### Ejecutar servicios individualmente

```bash
# Terminal 1 - MongoDB
docker run -p 27017:27017 mongo:latest

# Terminal 2 - S3
cd s3
npm start

# Terminal 3 - S2
cd s2
npm start

# Terminal 4 - S1
cd s1
npm start
```

## Estructura del Proyecto

```
password-security-system/
├── s1/                      # Servidor HTTPS principal
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── public/              # Cliente admin y user
│   ├── Dockerfile
│   └── package.json
├── s2/                      # Servidor gRPC
│   ├── src/
│   │   ├── proto/
│   │   ├── services/
│   │   └── data/
│   ├── Dockerfile
│   └── package.json
├── s3/                      # Servidor REST MongoDB
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── Dockerfile
│   └── package.json
├── client-admin/            # Panel administración
│   ├── index.html
│   ├── css/
│   └── js/
├── client-user/             # Portal usuario
│   ├── index.html
│   ├── css/
│   └── js/
├── certs/                   # Certificados TLS
├── scripts/                 # Scripts de utilidad
├── docker-compose.yml
├── .env
└── README.md
```

## Testing

Ejemplos de pruebas con curl:

### Login
```bash
curl -k -X POST https://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!@#Secure"}'
```

### Cambiar contraseña
```bash
curl -k -X POST https://localhost:3001/users/me/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword":"Admin123!@#Secure",
    "newPassword":"NewSecure123!@#Pass"
  }'
```

## Tolerancia a Fallos

- **S2**: Mantiene caché de políticas. Si S3 está caído, usa la última política en caché
- **S1**: Maneja fallos de S2/S3 con mensajes de error apropiados (HTTP 503)
- **Health Checks**: Todos los servicios exponen `/health`

## Notificaciones

El sistema envía notificaciones por Telegram cuando:
- La contraseña expira en 7 días o menos
- El usuario consulta el estado de su contraseña



