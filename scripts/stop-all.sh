#!/bin/bash

# Script para detener y limpiar todos los servicios

echo "🛑 Deteniendo servicios..."
docker-compose down

if [ "$1" == "--clean" ]; then
    echo "🧹 Limpiando volúmenes y datos..."
    docker-compose down -v
    echo "✅ Limpieza completada"
else
    echo "✅ Servicios detenidos"
    echo ""
    echo "💡 Para limpiar también los volúmenes, ejecuta: ./scripts/stop-all.sh --clean"
fi
