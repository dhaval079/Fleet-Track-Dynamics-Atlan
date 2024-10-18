const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const trackingService = require('../services/trackingService');
const pricingService = require('../services/pricingService');
const redisClient = require('../config/redis');
const { findMatchingDriver } = require('../services/matchingService');
const mongoose = require('mongoose');

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', '-password')
      .populate('driver', '-password')
      .populate('vehicle');
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
  }
};



exports.getUserBookings = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    // Find the user by email first
    const user = await User.findOne({ email: email }).select('_id');
    console.log("User's bookings are :",user)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Now find bookings for this user by _id
    const bookings = await Booking.find({ user: user._id })
      .populate('user', '-password')
      .populate('driver', '-password')
      .populate('vehicle')
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching user bookings', error: error.message });
  }
};




exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get the booking from cache
    const cachedBooking = await redisClient.get(`booking:${id}`);
    if (cachedBooking) {
      return res.status(200).json({ success: true, booking: JSON.parse(cachedBooking) });
    }

    // If not in cache, get from database
    const booking = await Booking.findById(id)
      .populate('user', '-password')
      .populate('driver', '-password')
      .populate('vehicle');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Cache the booking for future requests
    await redisClient.set(`booking:${id}`, JSON.stringify(booking), 'EX', 3600); // Cache for 1 hour

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
  }
};

exports.createFutureBooking = async (req, res) => {
  try {
    const { userId, driverId, vehicleId, pickup, dropoff, price: userProvidedPrice, scheduledTime } = req.body;

    console.log('Creating future booking with:', { userId, driverId, vehicleId, pickup, dropoff, userProvidedPrice, scheduledTime });

    if (new Date(scheduledTime) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    // Check if driver exists
    const driver = await User.findOne({ _id: driverId });
    if (!driver) {
      console.log('Driver not found:', driverId);
      return res.status(400).json({ success: false, message: 'Invalid driver' });
    }

    // Check if vehicle exists and belongs to the driver
    const vehicle = await Vehicle.findOne({ _id: vehicleId, driver: driverId });
    if (!vehicle) {
      console.log('Vehicle not found or does not belong to driver:', vehicleId, driverId);
      return res.status(400).json({ success: false, message: 'Invalid vehicle or vehicle does not belong to the driver' });
    }

    // Calculate distance (placeholder)
    const distance = Math.sqrt(
      Math.pow(dropoff.coordinates.lat - pickup.coordinates.lat, 2) +
      Math.pow(dropoff.coordinates.lng - pickup.coordinates.lng, 2)
    ) * 111; // Rough conversion to kilometers

    const currentDemand = await pricingService.getCurrentDemand();
    const calculatedPrice = pricingService.calculatePrice(distance, vehicle.vehicleType, currentDemand);

    // Use the calculated price if no price was provided, otherwise use the provided price
    const finalPrice = userProvidedPrice || calculatedPrice;

    const booking = new Booking({
      user: userId,
      driver: driverId,
      vehicle: vehicleId,
      pickup: {
        address: pickup.address,
        coordinates: {
          lat: Number(pickup.coordinates.lat),
          lng: Number(pickup.coordinates.lng)
        }
      },
      dropoff: {
        address: dropoff.address,
        coordinates: {
          lat: Number(dropoff.coordinates.lat),
          lng: Number(dropoff.coordinates.lng)
        }
      },
      price: finalPrice,
      scheduledTime,
      status: 'scheduled'
    });

    await booking.save();
    console.log('Future booking saved:', booking);

    // Fetch the saved booking with populated fields
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', '-password')
      .populate('driver', '-password')
      .populate('vehicle');

    console.log('Populated future booking:', populatedBooking);

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error('Error creating future booking:', error);
    res.status(400).json({ success: false, message: 'Error creating future booking', error: error.message });
  }
};


exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', '-password')
      .populate('driver', '-password')
      .populate('vehicle');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If the booking is completed or cancelled, make the driver and vehicle available again
    if (status === 'completed' || status === 'cancelled') {
      await User.findByIdAndUpdate(booking.driver._id, { isAvailable: true });
      await Vehicle.findByIdAndUpdate(booking.vehicle._id, { isAvailable: true });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating booking status', error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Make the driver and vehicle available again
    await User.findByIdAndUpdate(booking.driver, { isAvailable: true });
    await Vehicle.findByIdAndUpdate(booking.vehicle, { isAvailable: true });

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting booking', error: error.message });
  }
};


const SPEED_KM_PER_HOUR = 60;
const UPDATE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes


function calculateNewPosition(lat, lng, distanceKm) {
  const earthRadiusKm = 6371;
  const degreesPerKm = 1 / earthRadiusKm;
  const newLat = lat + (distanceKm * degreesPerKm);
  const newLng = lng + (distanceKm * degreesPerKm) / Math.cos(lat * Math.PI / 180);
  return { lat: newLat, lng: newLng };
}

exports.startTracking = async (bookingId, io) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  let currentLocation = booking.pickup.coordinates;
  const destination = booking.dropoff.coordinates;

  const updateInterval = setInterval(async () => {
    const distanceKm = (SPEED_KM_PER_HOUR / 30) * (UPDATE_INTERVAL_MS / 1000 / 60);
    currentLocation = calculateNewPosition(currentLocation.lat, currentLocation.lng, distanceKm);

    await trackingService.updateLocation(bookingId, currentLocation);
    if (global.io) {
      global.io.to(bookingId).emit('locationUpdate', currentLocation);
    } else {
      console.error('Socket.IO instance not available');
    }

    if (Math.abs(currentLocation.lat - destination.lat) < 0.0001 && 
        Math.abs(currentLocation.lng - destination.lng) < 0.0001) {
      clearInterval(updateInterval);
      await Booking.findByIdAndUpdate(bookingId, { status: 'completed' });
      if (global.io) {
        global.io.to(bookingId).emit('rideCompleted');
      }
    }
  }, UPDATE_INTERVAL_MS);

  return updateInterval;
};



exports.createBooking = async (req, res) => {
  try {
    const { userId, driverId, vehicleId, pickup, dropoff, price: userProvidedPrice } = req.body;

    console.log('Creating booking with:', { userId, driverId, vehicleId, pickup, dropoff, userProvidedPrice });

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    // Check if driver exists and is actually a driver
    const driver = await User.findOne({ _id: driverId });
    if (!driver) {
      console.log('Driver not found or not a driver:', driverId);
      return res.status(400).json({ success: false, message: 'Invalid driver' });
    }

    // Check if vehicle exists and belongs to the driver
    const vehicle = await Vehicle.findOne({ _id: vehicleId, driver: driverId });
    if (!vehicle) {
      console.log('Vehicle not found or does not belong to driver:', vehicleId, driverId);
      return res.status(400).json({ success: false, message: 'Invalid vehicle or vehicle does not belong to the driver' });
    }

    // Calculate distance (this is a placeholder, you'd use a real distance calculation service)
    const distance = Math.sqrt(
      Math.pow(dropoff.coordinates.lat - pickup.coordinates.lat, 2) +
      Math.pow(dropoff.coordinates.lng - pickup.coordinates.lng, 2)
    ) * 111; // Rough conversion to kilometers

    const currentDemand = await pricingService.getCurrentDemand();
    const calculatedPrice = pricingService.calculatePrice(distance, vehicle.vehicleType, currentDemand);

    // Use the calculated price if no price was provided, otherwise use the provided price
    const finalPrice = userProvidedPrice || calculatedPrice;

    console.log("Driver Id is : ", driverId);

    const booking = new Booking({
      user: userId,
      driver: driverId,
      vehicle: vehicleId,
     pickup: {
    address: pickup.address,
    coordinates: {
      lat: Number(pickup.coordinates.lat),
      lng: Number(pickup.coordinates.lng)
    }
  },
  dropoff: {
    address: dropoff.address,
    coordinates: {
      lat: Number(dropoff.coordinates.lat),
      lng: Number(dropoff.coordinates.lng)
    }
  },
      price: finalPrice,
      status: 'pending'
    });

    await booking.save();
    console.log('Booking saved:', booking);

    // const match = await findMatchingDriver(booking);

    // if (match) {
    //   booking.driver = match.driver._id;
    //   booking.vehicle = match.vehicle._id;
    //   booking.status = 'assigned';

    //   // Update driver and vehicle availability
    //   await User.findByIdAndUpdate(match.driver._id, { isAvailable: false });
    //   await Vehicle.findByIdAndUpdate(match.vehicle._id, { isAvailable: false });
    // }

    // Fetch the saved booking with populated fields
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', '-password')
      .populate('driver', '-password')
      .populate('vehicle');

    console.log('Populated booking:', populatedBooking);

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ success: false, message: 'Error creating booking', error: error.message });
  }
};


exports.matchDriver = async (req, res) => {
  try {
    const { userId, pickup } = req.body;
    console.log('Received match request:', { userId, pickup });

    if (!pickup || !pickup.coordinates || !pickup.coordinates.lat || !pickup.coordinates.lng) {
      return res.status(400).json({ success: false, message: 'Invalid pickup coordinates' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    const matchedDriver = await findMatchingDriver(pickup);

    if (matchedDriver) {
      res.status(200).json({ 
        success: true, 
        driver: {
          _id: matchedDriver._id,
          username: matchedDriver.username,
          currentLocation: matchedDriver.currentLocation
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'No matching driver found. Check server logs for details.' });
    }
  } catch (error) {
    console.error('Error matching driver:', error);
    res.status(500).json({ success: false, message: 'Error matching driver', error: error.message });
  }
};


exports.getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await trackingService.getLocation(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.status(200).json({ success: true, location });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ success: false, message: 'Error fetching location', error: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    await trackingService.updateLocation(id, { lat, lng });
    res.status(200).json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ success: false, message: 'Error updating location', error: error.message });
  }
};

module.exports = exports;