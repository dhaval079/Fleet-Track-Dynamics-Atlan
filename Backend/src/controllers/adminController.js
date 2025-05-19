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
    const { startDate, endDate, status } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
      query.status = status;
    }

    const totalBookings = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('user', 'username')
      .populate('driver', 'username')
      .populate('vehicle', 'make model')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: bookings,
      pagination: {
        totalBookings,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking data', error: error.message });
  }
};
exports.getFleetData = async (req, res) => {
  try {
    const fleetData = await Vehicle.find().populate('driver', 'username');
    res.json({ success: true, data: fleetData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching fleet data', error: error.message });
  }
};

exports.getTripAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };

    const totalTrips = await Booking.countDocuments(query);
    const completedTrips = await Booking.countDocuments({ ...query, status: 'completed' });

    const tripTimes = await Booking.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $project: { duration: { $subtract: ['$endTime', '$startTime'] } } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' }, count: { $sum: 1 } } }
    ]);

    const overallAvgTripTime = tripTimes.length > 0 ? tripTimes[0].totalDuration / tripTimes[0].count / 60000 : 0;

    const avgTripTimeByHour = await Booking.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $project: { hour: { $hour: '$startTime' }, duration: { $subtract: ['$endTime', '$startTime'] } } },
      { $group: { _id: '$hour', avgTime: { $avg: '$duration' } } },
      { $project: { hour: '$_id', avgTime: { $divide: ['$avgTime', 60000] } } },
      { $sort: { hour: 1 } }
    ]);

    const topDrivers = await Booking.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: {
        _id: '$driver',
        completedTrips: { $sum: 1 },
        totalRevenue: { $sum: '$price' },
        avgRating: { $avg: '$driverRating' }
      }},
      { $sort: { completedTrips: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'driverInfo' } },
      { $project: {
        driverId: '$_id',
        name: { $arrayElemAt: ['$driverInfo.username', 0] },
        completedTrips: 1,
        totalRevenue: 1,
        avgRating: 1
      }}
    ]);

    const incidentCount = await Booking.countDocuments({ ...query, hasIncident: true });

    res.json({
      success: true,
      data: {
        totalTrips,
        completedTrips,
        overallAvgTripTime,
        avgTripTimeByHour,
        topDrivers,
        incidentCount,
        avgDriverRating: topDrivers.reduce((sum, driver) => sum + driver.avgRating, 0) / topDrivers.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching trip analytics', error: error.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const query = { 
      status: 'completed',
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

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