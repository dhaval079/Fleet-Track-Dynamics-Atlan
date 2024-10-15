// src/controllers/adminController.js

const User = require('../models/User');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.getDashboard = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const driverCount = await User.countDocuments({ role: 'driver' });
    const bookingCount = await Booking.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();

    res.json({
      success: true,
      data: {
        userCount,
        driverCount,
        bookingCount,
        vehicleCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard data', error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const completedRides = await Booking.countDocuments({ status: 'completed' });
    const cancelledRides = await Booking.countDocuments({ status: 'cancelled' });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      success: true,
      data: {
        completedRides,
        cancelledRides,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching drivers', error: error.message });
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('driver', '-password');
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vehicles', error: error.message });
  }
};