# Sistema de Gestión de Políticas de Contraseñas Seguras

## 🚀 Inicio Rápido

### 1. Generar Certificados TLS
```powershell
.\scripts\generate-certs.ps1
```

### 2. Configurar Variables de Entorno
Copia `.env.example` a `.env` y configura:
- `JWT_SECRET`: Tu secreto para JWT
- `TELEGRAM_BOT_TOKEN`: Token de tu bot de Telegram (opcional)

### 3. Iniciar Servicios
```powershell
.\scripts\run-all.ps1
```

O directamente:
```powershell
docker-compose up --build
```

### 4. Acceder a las Aplicaciones
- **Cliente Admin**: https://localhost:3001/admin/
- **Cliente User**: https://localhost:3001/user/

**Credenciales por defecto:**
- Admin: `admin@example.com` / `Admin123!@#Secure`
- User: `user@example.com` / `User123!@#Secure`

## 📝 Comandos Útiles

### Ver logs
```powershell
.\scripts\logs.ps1           # Todos los servicios
.\scripts\logs.ps1 s1        # Solo S1
.\scripts\logs.ps1 s2        # Solo S2
.\scripts\logs.ps1 s3        # Solo S3
```

### Detener servicios
```powershell
.\scripts\stop-all.ps1                # Detener servicios
.\scripts\stop-all.ps1 --clean        # Detener y limpiar volúmenes
```

## 🧪 Probar la API

### Login
```powershell
$response = Invoke-WebRequest -Uri "https://localhost:3001/auth/login" -Method POST -Body '{"email":"admin@example.com","password":"Admin123!@#Secure"}' -ContentType "application/json" -SkipCertificateCheck
$token = ($response.Content | ConvertFrom-Json).data.token
```

### Obtener estado de contraseña
```powershell
Invoke-WebRequest -Uri "https://localhost:3001/users/me/password-status" -Headers @{"Authorization"="Bearer $token"} -SkipCertificateCheck
```

## 📚 Documentación Completa
Ver README.md en la raíz del proyecto.
