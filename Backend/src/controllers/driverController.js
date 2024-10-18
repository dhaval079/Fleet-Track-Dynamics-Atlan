const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching drivers', error: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' }).select('-password');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching driver', error: error.message });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const { username, email, password, licenseNumber, experienceYears } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newDriver = new User({
      username,
      email,
      password,
      role: 'driver',
      licenseNumber,
      experienceYears
    });

    await newDriver.save();
    res.status(201).json({ success: true, driver: newDriver.toObject({ getters: true, versionKey: false }) });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating driver', error: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const { licenseNumber, experienceYears, isAvailable } = req.body;
    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { licenseNumber, experienceYears, isAvailable },
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating driver', error: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const driver = await User.findOneAndDelete({ _id: req.params.id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting driver', error: error.message });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { 
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating driver location', error: error.message });
  }
};

exports.getDriverLocationByBookingId = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Received bookingId:', id);
    const booking = await Booking.findById(id).populate('driver', 'currentLocation');
    console.log('Found booking:', booking);
    
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.driver) {
      return res.status(404).json({ success: false, message: 'Driver not assigned to this booking' });
    }

    // Send back the driver's current location
    const driverLocation = booking.driver.currentLocation.coordinates;

    res.status(200).json({ success: true, driverLocation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching driver location', error: error.message });
  }
};


exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isAvailable: true }).select('-password');
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching available drivers', error: error.message });
  }
};

exports.updateDriverAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { isAvailable },
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, driver });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating driver availability', error: error.message });
  }
};

exports.getDriverBookings = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Driver email is required' });
    }

    const driver = await User.findOne({ email: email, role: 'driver' });

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    const bookings = await Booking.find({ driver: driver._id })
      .populate('user', 'username email')
      .populate('vehicle', 'make model licensePlate')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings: bookings });
  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching driver bookings', error: error.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const driverId = req.user.id;

    const booking = await Booking.findOne({ _id: id, driver: driverId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not assigned to this driver' });
    }

    booking.status = status;
    await booking.save();

    if (status === 'completed') {
      await User.findByIdAndUpdate(driverId, { isAvailable: true });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating job status', error: error.message });
  }
};

module.exports = exports;