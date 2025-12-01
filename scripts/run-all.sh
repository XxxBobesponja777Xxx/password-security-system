#!/bin/bash

# Script para iniciar todos los servicios con docker-compose

echo "🚀 Iniciando Sistema de Gestión de Políticas de Contraseñas..."
echo ""

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Verificar certificados TLS
if [ ! -f certs/server.key ] || [ ! -f certs/server.crt ]; then
    echo "⚠️  Certificados TLS no encontrados. Generando..."
    ./scripts/generate-certs.sh
    echo ""
fi

# Verificar archivo .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando de .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor configura tus variables de entorno."
    echo ""
fi

# Iniciar servicios
echo "🐳 Iniciando servicios con Docker Compose..."
docker-compose up --build

# Al finalizar
echo ""
echo "👋 Servicios detenidos"
