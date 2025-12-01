const mongoose = require('mongoose');

const passwordPolicySchema = new mongoose.Schema({
  minLength: {
    type: Number,
    required: true,
    default: 15
  },
  requireUppercase: {
    type: Boolean,
    required: true,
    default: true
  },
  requireLowercase: {
    type: Boolean,
    required: true,
    default: true
  },
  requireDigits: {
    type: Boolean,
    required: true,
    default: true
  },
  requireSymbols: {
    type: Boolean,
    required: true,
    default: true
  },
  maxPasswordAgeDays: {
    type: Number,
    required: true,
    default: 90
  },
  isActive: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Índices
passwordPolicySchema.index({ isActive: 1 });

// Middleware para asegurar solo una política activa
passwordPolicySchema.pre('save', async function(next) {
  if (this.isActive && this.isNew) {
    // Desactivar todas las demás políticas
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

const PasswordPolicy = mongoose.model('PasswordPolicy', passwordPolicySchema);

module.exports = PasswordPolicy;
