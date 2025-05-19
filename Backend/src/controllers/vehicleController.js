const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const User = require('../models/User');

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('driver');
    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vehicles', error: error.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driver');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vehicle', error: error.message });
  }
};
exports.getVehiclesByDriver = async (req, res) => {
    try {
      const driverId = req.params.driverId;
  
      // Check if the driver exists
      const driver = await User.findOne({ _id: driverId, role: 'driver' });
      if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }
  
      // Find all vehicles associated with this driver
      const vehicles = await Vehicle.find({ driver: driverId });
  
      res.status(200).json({ success: true, vehicles });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching vehicles', error: error.message });
    }
  };
  
exports.createVehicle = async (req, res) => {
    try {
      const { driverId, make, model, year, licensePlate, vehicleType, capacity, color } = req.body;
  
    // Check if driver exists and is actually a driver
    const driver = await User.findOne({ _id: driverId });
    if (!driver) {
      console.log('Driver not found or not a driver:', driverId);
      return res.status(400).json({ success: false, message: 'Invalid driver' });
    }
  
      const vehicle = new Vehicle({
        driver: driverId,
        make,
        model,
        year,
        licensePlate,
        vehicleType,
        capacity,
        color
      });
  
      await vehicle.save();
      res.status(201).json({ success: true, vehicle });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Error creating vehicle', error: error.message });
    }
  };

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('driver');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating vehicle', error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting vehicle', error: error.message });
  }
};

exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isAvailable: true }).populate('driver');
    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching available vehicles', error: error.message });
  }
};

module.exports = exports;