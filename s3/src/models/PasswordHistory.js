const mongoose = require('mongoose');

const passwordHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
passwordHistorySchema.index({ userId: 1, changedAt: -1 });

// Método estático para obtener historial de un usuario
passwordHistorySchema.statics.getUserHistory = async function(userId, limit = 5) {
  return this.find({ userId })
    .sort({ changedAt: -1 })
    .limit(limit);
};

const PasswordHistory = mongoose.model('PasswordHistory', passwordHistorySchema);

module.exports = PasswordHistory;
