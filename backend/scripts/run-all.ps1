# Script para iniciar todos los servicios con docker-compose (PowerShell)

Write-Host "🚀 Iniciando Sistema de Gestión de Políticas de Contraseñas..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker está corriendo
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw
    }
} catch {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar certificados TLS
if (-not (Test-Path "certs/server.key") -or -not (Test-Path "certs/server.crt")) {
    Write-Host "⚠️  Certificados TLS no encontrados. Generando..." -ForegroundColor Yellow
    & .\scripts\generate-certs.ps1
    Write-Host ""
}

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado. Copiando de .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado. Por favor configura tus variables de entorno." -ForegroundColor Green
    Write-Host ""
}

# Iniciar servicios
Write-Host "🐳 Iniciando servicios con Docker Compose..." -ForegroundColor Cyan
docker-compose up --build

# Al finalizar
Write-Host ""
Write-Host "👋 Servicios detenidos" -ForegroundColor Gray
