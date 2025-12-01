const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const passwordService = require('./services/passwordService');

const PROTO_PATH = path.join(__dirname, 'proto', 'password.proto');
const PORT = process.env.GRPC_PORT || 50051;

// Cargar el archivo .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const passwordProto = grpc.loadPackageDefinition(packageDefinition).password;

/**
 * Implementación del servicio ValidatePassword
 */
async function validatePassword(call, callback) {
  try {
    const { email, newPassword, previousPasswordHash } = call.request;

    console.log(`📝 Validando contraseña para: ${email}`);

    const result = await passwordService.validatePassword(
      email,
      newPassword,
      previousPasswordHash
    );

    callback(null, result);
  } catch (error) {
    console.error('Error en validación gRPC:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message
    });
  }
}

/**
 * Iniciar el servidor gRPC
 */
function main() {
  const server = new grpc.Server();

  server.addService(passwordProto.PasswordService.service, {
    ValidatePassword: validatePassword
  });

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Error al iniciar servidor gRPC:', error);
        return;
      }
      console.log(`🚀 S2 (gRPC Service) corriendo en puerto ${port}`);
      console.log(`📡 Esperando conexiones gRPC...`);
      
      // Iniciar caché de política
      passwordService.startPolicyCacheRefresh();
    }
  );
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

main();
