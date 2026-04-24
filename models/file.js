const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  fileName: {
    type: String,
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  format: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  createdBy: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model('File', fileSchema);