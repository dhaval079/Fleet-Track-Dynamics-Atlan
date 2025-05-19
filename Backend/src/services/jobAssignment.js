// src/services/jobAssignmentService.js

const User = require('../models/User');

const assignDriver = async (booking) => {
  try {
    // Find available drivers near the pickup location
    const availableDrivers = await User.find({
      role: 'driver',
      isAvailable: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [booking.pickup.coordinates.lng, booking.pickup.coordinates.lat]
          },
          $maxDistance: 10000 // 10km radius
        }
      }
    }).limit(1);

    if (availableDrivers.length > 0) {
      const assignedDriver = availableDrivers[0];
      assignedDriver.isAvailable = false;
      await assignedDriver.save();
      return assignedDriver;
    }

    return null;
  } catch (error) {
    console.error('Error assigning driver:', error);
    return null;
  }
};

module.exports = { assignDriver };