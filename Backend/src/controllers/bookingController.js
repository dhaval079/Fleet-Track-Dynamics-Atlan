const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const trackingService = require('../services/trackingService');

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

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', '-password')
      .populate('driver', '-password')
      .populate('vehicle');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
  }
};

exports.createBooking = async (req, res) => {
    try {
      const { userId, driverId, vehicleId, pickup, dropoff, price } = req.body;
  
      console.log('Creating booking with:', { userId, driverId, vehicleId, pickup, dropoff, price });
  
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
      console.log("Driver Id is : ", driverId);

      const booking = new Booking({
        user: userId,
        driver: driverId,
        vehicle: vehicleId,
        pickup,
        dropoff,
        price,
        status: 'pending'
      });
  
      await booking.save();
      console.log('Booking saved:', booking);
  
      // Update driver and vehicle availability
      await User.findByIdAndUpdate(driverId, { isAvailable: false });
      await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: false });
  
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