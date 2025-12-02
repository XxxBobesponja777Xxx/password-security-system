# Script para ver los logs de los servicios (PowerShell)

param(
    [string]$Service
)

if ([string]::IsNullOrEmpty($Service)) {
    Write-Host "📋 Mostrando logs de todos los servicios..." -ForegroundColor Cyan
    docker-compose logs -f
} else {
    Write-Host "📋 Mostrando logs de $Service..." -ForegroundColor Cyan
    docker-compose logs -f $Service
}
