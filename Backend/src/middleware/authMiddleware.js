const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authentication = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Add user object to request
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is invalid' });
  }
};

module.exports = { authentication };