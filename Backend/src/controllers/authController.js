const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const { username, email, password, role, licenseNumber, experienceYears } = req.body;
    
    if (role === 'driver' && (!licenseNumber || !experienceYears)) {
      return res.status(400).json({ success: false, message: 'License number and experience years are required for drivers' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = new User({ 
      username, 
      email, 
      password, 
      role,
      ...(role === 'driver' && { licenseNumber, experienceYears })
    });
    
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      success: true, 
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set token in HTTP-only cookie
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ 
      success: true, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role
      } 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user data', error: error.message });
  }
};

// New function to refresh token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', newToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ success: true, message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};