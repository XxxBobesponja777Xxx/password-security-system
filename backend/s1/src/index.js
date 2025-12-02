const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir archivos estáticos de los clientes
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
app.use('/user', express.static(path.join(__dirname, '../public/user')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 's1-https-service',
    timestamp: new Date().toISOString(),
    tls: 'enabled'
  });
});

// Rutas de API
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Sistema de Gestión de Contraseñas</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          h1 { text-align: center; }
          .links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
          }
          a {
            display: inline-block;
            padding: 15px 30px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: transform 0.2s;
          }
          a:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <h1>🔐 Sistema de Gestión de Políticas de Contraseñas</h1>
        <p style="text-align: center;">Bienvenido al sistema de seguridad de contraseñas</p>
        <div class="links">
          <a href="/admin/">Panel de Administración</a>
          <a href="/user/">Portal de Usuario</a>
        </div>
      </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    data: null,
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor HTTPS
const startServer = () => {
  try {
    // Leer certificados TLS
    const certPath = process.env.TLS_CERT_PATH || path.join(__dirname, '../certs/server.crt');
    const keyPath = process.env.TLS_KEY_PATH || path.join(__dirname, '../certs/server.key');

    let httpsOptions;

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      httpsOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
      console.log('✅ Certificados TLS cargados');
    } else {
      console.warn('⚠️  Certificados TLS no encontrados. Generando certificados temporales...');
      console.warn('⚠️  Para producción, ejecuta: npm run generate-certs');
      
      // En desarrollo, usar certificados generados automáticamente
      const { generateSelfSignedCert } = require('./utils/certGenerator');
      httpsOptions = generateSelfSignedCert();
    }

    // Crear servidor HTTPS
    const server = https.createServer(httpsOptions, app);

    server.listen(PORT, () => {
      console.log(`🚀 S1 (HTTPS Service) corriendo en puerto ${PORT}`);
      console.log(`🔒 TLS/SSL habilitado`);
      console.log(`📱 Cliente Admin: https://localhost:${PORT}/admin/`);
      console.log(`👤 Cliente User: https://localhost:${PORT}/user/`);
      console.log(`🔑 JWT Secret configurado: ${process.env.JWT_SECRET ? 'Sí' : 'No (usando default)'}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
