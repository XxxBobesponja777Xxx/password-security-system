const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const policyRoutes = require('./routes/policyRoutes');
const initializeDefaultData = require('./config/initData');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de seguridad interna
app.use((req, res, next) => {
  const internalSecret = req.headers['x-internal-secret'];
  if (process.env.INTERNAL_SECRET && internalSecret !== process.env.INTERNAL_SECRET) {
    // En producción, podrías hacer esto más estricto
    console.warn('Advertencia: Request sin secret interno válido');
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 's3-data-service',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Routes
app.use('/users', userRoutes);
app.use('/policies', policyRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    data: null,
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log('✅ MongoDB conectado exitosamente');

    // Inicializar datos por defecto
    await initializeDefaultData();
    console.log('✅ Datos por defecto inicializados');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 S3 (Data Service) corriendo en puerto ${PORT}`);
      console.log(`📊 MongoDB URI: ${process.env.MONGO_URI}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
