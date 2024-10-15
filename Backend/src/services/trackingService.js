const redisClient = require('../config/redis');

exports.updateLocation = async (bookingId, location) => {
  try {
    const key = `location:${bookingId}`;
    const value = JSON.stringify(location);
    await redisClient.set(key, value);
    console.log(`Updated location for ${key}: ${value}`);
  } catch (error) {
    console.error(`Error updating location for ${bookingId}:`, error);
    throw error;
  }
};

exports.getLocation = async (bookingId) => {
  try {
    const key = `location:${bookingId}`;
    const locationString = await redisClient.get(key);
    console.log(`Retrieved location for ${key}: ${locationString}`);
    return locationString ? JSON.parse(locationString) : null;
  } catch (error) {
    console.error(`Error getting location for ${bookingId}:`, error);
    throw error;
  }
};

module.exports = exports;