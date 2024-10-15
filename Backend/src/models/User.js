const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
  // Fields for drivers
  licenseNumber: { type: String, unique: true, sparse: true },
  experienceYears: { type: Number },
  isAvailable: { type: Boolean, default: false },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  // Common fields
  phoneNumber: { type: String },
  address: { type: String },
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.index({ currentLocation: '2dsphere' });

userSchema.index({ role: 1, isAvailable: 1 });
userSchema.index({ 'currentLocation': '2dsphere' });

module.exports = mongoose.model('User', userSchema);