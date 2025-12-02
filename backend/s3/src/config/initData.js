const User = require('../models/User');
const PasswordPolicy = require('../models/PasswordPolicy');
const bcrypt = require('bcrypt');

/**
 * Inicializa datos por defecto en la base de datos
 */
const initializeDefaultData = async () => {
  try {
    // Verificar si ya existe una política activa
    const existingPolicy = await PasswordPolicy.findOne({ isActive: true });
    
    if (!existingPolicy) {
      console.log('📋 Creando política de contraseñas por defecto...');
      
      const defaultPolicy = new PasswordPolicy({
        minLength: 15,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
        maxPasswordAgeDays: 90,
        isActive: true
      });
      
      await defaultPolicy.save();
      console.log('✅ Política por defecto creada');
    }

    // Verificar si existe un usuario admin
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      console.log('👤 Creando usuario admin por defecto...');
      
      // Password: Admin123!@#Secure
      const passwordHash = await bcrypt.hash('Admin123!@#Secure', 12);
      
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 90); // 90 días
      
      const adminUser = new User({
        email: 'admin@example.com',
        role: 'admin',
        passwordHash,
        passwordLastChangedAt: now,
        passwordExpiresAt: expiresAt
      });
      
      await adminUser.save();
      console.log('✅ Usuario admin creado (admin@example.com / Admin123!@#Secure)');
    }

    // Crear un usuario de prueba
    const existingUser = await User.findOne({ email: 'user@example.com' });
    
    if (!existingUser) {
      console.log('👤 Creando usuario de prueba...');
      
      const passwordHash = await bcrypt.hash('User123!@#Secure', 12);
      
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 90);
      
      const testUser = new User({
        email: 'user@example.com',
        role: 'user',
        passwordHash,
        passwordLastChangedAt: now,
        passwordExpiresAt: expiresAt
      });
      
      await testUser.save();
      console.log('✅ Usuario de prueba creado (user@example.com / User123!@#Secure)');
    }

  } catch (error) {
    console.error('Error inicializando datos por defecto:', error);
  }
};

module.exports = initializeDefaultData;
