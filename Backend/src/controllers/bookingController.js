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
      pickup,
      dropoff,
      price: finalPrice,
      status: 'pending'
    });

    await booking.save();
    console.log('Booking saved:', booking);

    const match = await findMatchingDriver(booking);

    if (match) {
      booking.driver = match.driver._id;
      booking.vehicle = match.vehicle._id;
      booking.status = 'assigned';

      // Update driver and vehicle availability
      await User.findByIdAndUpdate(match.driver._id, { isAvailable: false });
      await Vehicle.findByIdAndUpdate(match.vehicle._id, { isAvailable: false });
    }

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

exports.createFutureBooking = async (req, res) => {
  try {
    const { userId, pickup, dropoff, vehicleType, scheduledTime } = req.body;

    if (new Date(scheduledTime) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    // Calculate distance (placeholder)
    const distance = Math.sqrt(
      Math.pow(dropoff.coordinates.lat - pickup.coordinates.lat, 2) +
      Math.pow(dropoff.coordinates.lng - pickup.coordinates.lng, 2)
    ) * 111; // Rough conversion to kilometers

    const currentDemand = await pricingService.getCurrentDemand();
    const estimatedPrice = pricingService.calculatePrice(distance, vehicleType, currentDemand);

    const booking = new Booking({
      user: userId,
      pickup,
      dropoff,
      vehicleType,
      estimatedPrice,
      scheduledTime,
      status: 'scheduled'
    });

    await booking.save();

    res.status(201).json({ success: true, booking });
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

exports.startTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Initialize tracking
    await trackingService.updateLocation(id, { lat: 0, lng: 0 });
    
    res.status(200).json({ success: true, message: 'Tracking started' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting tracking', error: error.message });
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