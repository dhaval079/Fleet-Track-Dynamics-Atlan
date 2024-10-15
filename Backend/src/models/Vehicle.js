const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    enum: ['sedan', 'suv', 'van', 'truck'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  color: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);