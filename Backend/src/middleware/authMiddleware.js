// authMiddleware.js
const jwt = require('jsonwebtoken');

const authentication = async (req, res, next) => {
  try {
    // Log the headers for debugging
    console.log('Request Headers:', req.headers);

    let token = req.header('Authorization');
    
    // Check if the token is in the correct format
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7);
    } else {
      token = req.cookies.token || req.body.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Token Not Found" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating token",
    });
  }
};

module.exports = { authentication };