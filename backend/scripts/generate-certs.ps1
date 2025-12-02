# Script para generar certificados TLS autofirmados (PowerShell)
# Para desarrollo/pruebas - NO usar en producción

Write-Host "🔐 Generando certificados TLS autofirmados..." -ForegroundColor Cyan

# Crear directorio de certificados
if (-not (Test-Path "certs")) {
    New-Item -ItemType Directory -Path "certs" | Out-Null
}

# Verificar si openssl está disponible
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if ($opensslPath) {
    # Generar con OpenSSL
    & openssl req -x509 `
      -newkey rsa:4096 `
      -keyout certs/server.key `
      -out certs/server.crt `
      -days 365 `
      -nodes `
      -subj "/C=US/ST=Development/L=Dev/O=Password Security System/CN=localhost"
    
    if ((Test-Path "certs/server.key") -and (Test-Path "certs/server.crt")) {
        Write-Host "✅ Certificados generados exitosamente:" -ForegroundColor Green
        Write-Host "   - certs/server.key" -ForegroundColor Gray
        Write-Host "   - certs/server.crt" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  ADVERTENCIA: Estos son certificados autofirmados solo para desarrollo." -ForegroundColor Yellow
        Write-Host "   Los navegadores mostrarán una advertencia de seguridad que debes aceptar." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error al generar certificados" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ OpenSSL no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "1. Instalar OpenSSL desde: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Gray
    Write-Host "2. Usar Chocolatey: choco install openssl" -ForegroundColor Gray
    Write-Host "3. Los certificados se generarán automáticamente al iniciar S1" -ForegroundColor Gray
    exit 1
}
