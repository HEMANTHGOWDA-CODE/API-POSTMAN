const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  mobile: {
    type: String,
    required: true,
    unique: true
  },

  age: {
    type: Number,
    required: true,
    min: 1
  },

  password: {
    type: String,
    required: true
  },

  // ✅ Custom fields
  createdAt: {
    type: Date,
    default: Date.now
  },

  createdBy: {
    type: String, // later you can change to ObjectId (user reference)
    required: true
  }

});
userSchema.pre('save', async function () {
  // only hash if password is modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);