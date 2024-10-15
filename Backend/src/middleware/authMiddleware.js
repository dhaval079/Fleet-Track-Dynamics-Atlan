const jwt = require('jsonwebtoken');

const authentication = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      (req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : null);

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
