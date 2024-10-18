// In services/matchingService.js

const User = require('../models/User');

const findMatchingDriver = async (pickup) => {
  try {
    console.log('Searching for nearest driver with pickup:', pickup);

    // Validate pickup coordinates
    if (!pickup.coordinates || !pickup.coordinates.lat || !pickup.coordinates.lng) {
      console.error('Invalid pickup coordinates:', pickup.coordinates);
      return null;
    }

    // Find the nearest driver
    const nearestDriver = await User.findOne({
      role: 'driver',
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickup.coordinates.lng, pickup.coordinates.lat]
          },
          $maxDistance: 1000000 // 10km radius
        }
      }
    }).sort({ 'currentLocation': 1 });

    if (!nearestDriver) {
      console.log('No driver found within 10km radius');
      return null;
    }

    console.log('Nearest driver found:', nearestDriver.username);
    console.log('Driver location:', nearestDriver.currentLocation);

    return nearestDriver;
  } catch (error) {
    console.error('Error in matching algorithm:', error);
    return null;
  }
};

module.exports = { findMatchingDriver };