# Ejemplos de API

## Autenticación

### Login
```bash
curl -k -X POST https://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!@#Secure"
  }'
```

**Respuesta:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@example.com",
      "role": "admin"
    }
  },
  "error": null
}
```

### Verificar Token
```bash
curl -k -X GET https://localhost:3001/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Usuario

### Obtener Estado de Contraseña
```bash
curl -k -X GET https://localhost:3001/users/me/password-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "data": {
    "daysRemaining": 85,
    "expiringSoon": false,
    "passwordLastChangedAt": "2025-01-15T10:30:00.000Z",
    "passwordExpiresAt": "2025-04-15T10:30:00.000Z"
  },
  "error": null
}
```

### Cambiar Contraseña
```bash
curl -k -X POST https://localhost:3001/users/me/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin123!@#Secure",
    "newPassword": "NewSecure123!@#Pass"
  }'
```

**Respuesta exitosa:**
```json
{
  "data": {
    "message": "Contraseña cambiada exitosamente",
    "passwordExpiresAt": "2025-07-15T10:30:00.000Z"
  },
  "error": null
}
```

**Respuesta con error de validación:**
```json
{
  "data": null,
  "error": "La contraseña no cumple con los requisitos",
  "reasons": [
    "La contraseña debe tener al menos 15 caracteres",
    "La contraseña debe contener al menos un símbolo especial"
  ]
}
```

## Admin - Usuarios

### Listar Usuarios
```bash
curl -k -X GET https://localhost:3001/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Crear Usuario
```bash
curl -k -X POST https://localhost:3001/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "user",
    "password": "SecurePassword123!@#",
    "telegramChatId": "123456789"
  }'
```

### Actualizar Usuario
```bash
curl -k -X PUT https://localhost:3001/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "telegramChatId": "987654321"
  }'
```

### Eliminar Usuario
```bash
curl -k -X DELETE https://localhost:3001/admin/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Admin - Políticas

### Obtener Política Activa
```bash
curl -k -X GET https://localhost:3001/admin/policies/active \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Respuesta:**
```json
{
  "data": {
    "_id": "...",
    "minLength": 15,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireDigits": true,
    "requireSymbols": true,
    "maxPasswordAgeDays": 90,
    "isActive": true,
    "description": "Política de seguridad estándar"
  },
  "error": null
}
```

### Listar Todas las Políticas
```bash
curl -k -X GET https://localhost:3001/admin/policies \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Crear Política
```bash
curl -k -X POST https://localhost:3001/admin/policies \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "minLength": 20,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireDigits": true,
    "requireSymbols": true,
    "maxPasswordAgeDays": 60,
    "isActive": false,
    "description": "Política de alta seguridad"
  }'
```

### Actualizar Política (Activar)
```bash
curl -k -X PUT https://localhost:3001/admin/policies/POLICY_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": true
  }'
```

## Códigos de Estado HTTP

- `200` - Éxito
- `201` - Recurso creado
- `400` - Petición inválida
- `401` - No autenticado
- `403` - No autorizado (sin permisos)
- `404` - No encontrado
- `409` - Conflicto (ej. email ya existe)
- `500` - Error del servidor
- `503` - Servicio no disponible

## Ejemplos con PowerShell

### Login
```powershell
$body = @{
    email = "admin@example.com"
    password = "Admin123!@#Secure"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "https://localhost:3001/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -SkipCertificateCheck

$data = ($response.Content | ConvertFrom-Json).data
$token = $data.token
```

### Cambiar Contraseña
```powershell
$body = @{
    currentPassword = "Admin123!@#Secure"
    newPassword = "NewSecure123!@#Pass"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "https://localhost:3001/users/me/change-password" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $token"} `
    -Body $body `
    -ContentType "application/json" `
    -SkipCertificateCheck
```

### Listar Usuarios (Admin)
```powershell
$response = Invoke-WebRequest `
    -Uri "https://localhost:3001/admin/users" `
    -Headers @{"Authorization"="Bearer $token"} `
    -SkipCertificateCheck

($response.Content | ConvertFrom-Json).data
```
