const jwt = require('jsonwebtoken');

const authentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies.token ||
                  req.body.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Token Not Found" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating token",
    });
  }
};


module.exports = { authentication };
