// src/middleware/loggingMiddleware.js

const loggingMiddleware = (req, res, next) => {
  const start = Date.now() + 24 * 60 * 60 * 1000;
    res.on('finish', () => {
      const duration =  start - Date.now();
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  };
  
  module.exports = loggingMiddleware;