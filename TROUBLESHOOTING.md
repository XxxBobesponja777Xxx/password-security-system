# Solución de Problemas

## Problemas Comunes

### 1. Error: "Docker no está corriendo"

**Solución:**
- Inicia Docker Desktop
- Espera a que el ícono de Docker muestre "Docker Desktop is running"

### 2. Error: "Certificados TLS no encontrados"

**Solución:**
```powershell
.\scripts\generate-certs.ps1
```

Si OpenSSL no está instalado, los certificados se generarán automáticamente al iniciar S1.

### 3. Error: "Puerto 3001 ya está en uso"

**Solución:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3001

# Detener el proceso o cambiar el puerto en .env
```

### 4. Error: "Cannot connect to MongoDB"

**Solución:**
- Verifica que el contenedor de MongoDB esté corriendo: `docker ps`
- Reinicia los servicios: `docker-compose restart`

### 5. Navegador muestra "Conexión no segura"

**Solución:**
Esto es normal con certificados autofirmados:
- Chrome: Click en "Avanzado" → "Continuar a localhost"
- Firefox: Click en "Avanzado" → "Aceptar el riesgo y continuar"

### 6. Error 503: "Servicio de validación no disponible"

**Solución:**
- Verifica que S2 (gRPC) esté corriendo: `docker ps`
- Ver logs: `.\scripts\logs.ps1 s2`
- Reinicia S2: `docker-compose restart s2`

### 7. JWT Token inválido o expirado

**Solución:**
- Cierra sesión y vuelve a iniciar sesión
- Los tokens expiran en 1 hora por defecto

### 8. No recibo notificaciones de Telegram

**Solución:**
- Verifica que `TELEGRAM_BOT_TOKEN` esté configurado en `.env`
- Verifica que el usuario tenga `telegramChatId` configurado
- Envía un mensaje a tu bot y obtén tu chat ID:
  ```
  https://api.telegram.org/bot<TU_TOKEN>/getUpdates
  ```

### 9. Error al cambiar contraseña

**Posibles causas:**
- La contraseña no cumple los requisitos (ver lista en el cliente)
- Es muy similar a la anterior
- Está en la lista de contraseñas débiles

**Solución:**
- Lee los mensajes de error que proporciona el sistema
- Usa una contraseña completamente diferente

### 10. Base de datos se reinicia al detener Docker

**Solución:**
Para mantener los datos entre reinicios, los volúmenes de Docker ya están configurados.

Para limpiar la base de datos:
```powershell
.\scripts\stop-all.ps1 --clean
```

## Logs y Debugging

### Ver logs de todos los servicios
```powershell
docker-compose logs -f
```

### Ver logs de un servicio específico
```powershell
docker-compose logs -f s1  # S1 (HTTPS)
docker-compose logs -f s2  # S2 (gRPC)
docker-compose logs -f s3  # S3 (MongoDB)
docker-compose logs -f mongo
```

### Acceder a un contenedor
```powershell
docker exec -it password-security-s1 sh
docker exec -it password-security-s2 sh
docker exec -it password-security-s3 sh
docker exec -it password-security-mongo mongosh
```

### Verificar estado de los servicios
```powershell
docker ps
docker-compose ps
```

## Soporte

Si el problema persiste:
1. Revisa los logs detallados
2. Verifica la configuración en `.env`
3. Abre un Issue en GitHub con:
   - Descripción del problema
   - Logs relevantes
   - Pasos para reproducir
