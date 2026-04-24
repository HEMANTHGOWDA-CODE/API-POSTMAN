const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({

  // 🔗 Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 🔐 Refresh Token
  refreshToken: {
    type: String,
    required: true
  },

  // (Optional but useful)
  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Auth', authSchema);