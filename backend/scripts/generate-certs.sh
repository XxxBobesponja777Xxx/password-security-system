#!/bin/bash

# Script para generar certificados TLS autofirmados
# Para desarrollo/pruebas - NO usar en producción

echo "🔐 Generando certificados TLS autofirmados..."

# Crear directorio de certificados
mkdir -p certs

# Generar clave privada y certificado
openssl req -x509 \
  -newkey rsa:4096 \
  -keyout certs/server.key \
  -out certs/server.crt \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=Development/L=Dev/O=Password Security System/CN=localhost"

# Verificar que se crearon
if [ -f certs/server.key ] && [ -f certs/server.crt ]; then
    echo "✅ Certificados generados exitosamente:"
    echo "   - certs/server.key"
    echo "   - certs/server.crt"
    echo ""
    echo "⚠️  ADVERTENCIA: Estos son certificados autofirmados solo para desarrollo."
    echo "   Los navegadores mostrarán una advertencia de seguridad que debes aceptar."
else
    echo "❌ Error al generar certificados"
    exit 1
fi
