const Driver = require('../models/Driver');
const User = require('../models/User');

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
    const driver = await Driver.findById(req.params.id).populate('user', '-password');
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
    const { userId, licenseNumber, experienceYears } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    const driver = new Driver({
      user: userId,
      licenseNumber,
      experienceYears
    });

    await driver.save();
    res.status(201).json({ success: true, driver });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating driver', error: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('user', '-password');
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
    const driver = await Driver.findByIdAndDelete(req.params.id);
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

module.exports = exports;