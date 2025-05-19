const User = require('../models/User');

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking admin status', error: error.message });
  }
};