const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user'
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordLastChangedAt: {
    type: Date,
    default: Date.now
  },
  passwordExpiresAt: {
    type: Date,
    required: true
  },
  telegramChatId: {
    type: String,
    default: null
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  lastNotificationDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Método para calcular días restantes hasta expiración
userSchema.methods.getDaysUntilExpiration = function() {
  const now = new Date();
  const diffTime = this.passwordExpiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Método para verificar si la contraseña está por expirar
userSchema.methods.isPasswordExpiringSoon = function(daysThreshold = 7) {
  return this.getDaysUntilExpiration() <= daysThreshold;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
