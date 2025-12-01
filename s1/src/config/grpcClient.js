const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/password.proto');
const S2_GRPC_HOST = process.env.S2_GRPC_HOST || 'localhost';
const S2_GRPC_PORT = process.env.S2_GRPC_PORT || 50051;

// Cargar definición del proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const passwordProto = grpc.loadPackageDefinition(packageDefinition).password;

// Crear cliente gRPC
const grpcClient = new passwordProto.PasswordService(
  `${S2_GRPC_HOST}:${S2_GRPC_PORT}`,
  grpc.credentials.createInsecure()
);

console.log(`📡 Cliente gRPC configurado: ${S2_GRPC_HOST}:${S2_GRPC_PORT}`);

/**
 * Validar contraseña usando gRPC
 */
function validatePassword(email, newPassword, previousPasswordHash = '') {
  return new Promise((resolve, reject) => {
    const request = {
      email,
      newPassword,
      previousPasswordHash: previousPasswordHash || ''
    };

    grpcClient.ValidatePassword(request, (error, response) => {
      if (error) {
        console.error('[gRPC Client] Error:', error.message);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

module.exports = {
  grpcClient,
  validatePassword
};
