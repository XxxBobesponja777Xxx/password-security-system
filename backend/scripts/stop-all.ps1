# Script para detener y limpiar todos los servicios (PowerShell)

Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
docker-compose down

if ($args[0] -eq "--clean") {
    Write-Host "🧹 Limpiando volúmenes y datos..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
} else {
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Para limpiar también los volúmenes, ejecuta: .\scripts\stop-all.ps1 --clean" -ForegroundColor Cyan
}
