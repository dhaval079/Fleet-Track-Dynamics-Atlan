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


exports.getDriverActivity = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { role: 'driver' };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const drivers = await User.find(query).select('-password');
    const driverIds = drivers.map(driver => driver._id);

    const bookings = await Booking.find({
      driver: { $in: driverIds },
      createdAt: query.createdAt
    });

    const driverActivity = drivers.map(driver => {
      const driverBookings = bookings.filter(booking => booking.driver.toString() === driver._id.toString());
      return {
        driverId: driver._id,
        name: driver.username,
        totalBookings: driverBookings.length,
        completedBookings: driverBookings.filter(booking => booking.status === 'completed').length,
        cancelledBookings: driverBookings.filter(booking => booking.status === 'cancelled').length,
        totalRevenue: driverBookings.reduce((sum, booking) => sum + (booking.price || 0), 0)
      };
    });

    res.json({ success: true, data: driverActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching driver activity', error: error.message });
  }
};

exports.getBookingData = async (req, res) => {
  try {
    const { startDate, endDate, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }

    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limit);

    const bookings = await Booking.find(query)
      .populate('user', 'username')
      .populate('driver', 'username')
      .populate('vehicle', 'make model')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalBookings,
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking data', error: error.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'completed' };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const revenueData = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$price" },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: revenueData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching revenue analytics', error: error.message });
  }
};

module.exports = exports;