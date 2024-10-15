// src/services/matchingService.js

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

const findMatchingDriver = async (booking) => {
  try {
    const { pickup, vehicleType, userPreferences } = booking;

    const matchingDrivers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [pickup.coordinates.lng, pickup.coordinates.lat]
          },
          distanceField: "distance",
          maxDistance: 10000, // 10km radius
          query: { role: 'driver', isAvailable: true },
          spherical: true
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: 'driver',
          as: 'vehicles'
        }
      },
      {
        $match: {
          'vehicles.vehicleType': vehicleType,
          'vehicles.isAvailable': true
        }
      },
      {
        $addFields: {
          rating: { $ifNull: ['$rating', 0] },
          score: {
            $add: [
              { $multiply: [{ $divide: [1, { $add: ['$distance', 1] }] }, 50] }, // Distance score (max 50)
              { $multiply: ['$rating', 10] } // Rating score (max 50)
            ]
          }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 1
      }
    ]);

    if (matchingDrivers.length === 0) {
      return null;
    }

    const matchedDriver = matchingDrivers[0];
    const matchedVehicle = await Vehicle.findOne({ driver: matchedDriver._id, vehicleType, isAvailable: true });

    return { driver: matchedDriver, vehicle: matchedVehicle };
  } catch (error) {
    console.error('Error in matching algorithm:', error);
    return null;
  }
};

module.exports = { findMatchingDriver };