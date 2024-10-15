// src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      error: process.env.NODE_ENV === 'production' ? {} : err
    });
  };
  
  module.exports = errorHandler;