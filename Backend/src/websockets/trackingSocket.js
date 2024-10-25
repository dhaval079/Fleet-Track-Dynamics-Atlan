// src/websockets/trackingSocket.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');
const trackingService = require('../services/trackingService');

function setupWebSocket(server, options = {}) {
  const io = socketIo(server, {
    path: '/socket.io',
    ...options,
    // Additional Socket.IO options
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Debug middleware
  io.use((socket, next) => {
    console.log('Socket middleware - handshake details:', {
      query: socket.handshake.query,
      auth: socket.handshake.auth,
      headers: socket.handshake.headers
    });
    next();
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('subscribe', async (bookingId) => {
      try {
        console.log(`Subscription request for booking ${bookingId} from user ${socket.userId}`);
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
          throw new Error('Booking not found');
        }
        
        if (booking.user.toString() !== socket.userId && 
            booking.driver.toString() !== socket.userId) {
          throw new Error('Unauthorized');
        }
        
        socket.join(bookingId);
        console.log(`Client ${socket.id} subscribed to booking ${bookingId}`);
        
        // Send initial location if available
        const currentLocation = await trackingService.getLocation(bookingId);
        if (currentLocation) {
          socket.emit('locationUpdate', currentLocation);
        }
      } catch (error) {
        console.error('Subscribe error:', error);
        socket.emit('error', error.message);
      }
    });

    socket.on('updateLocation', async ({ bookingId, location }) => {
      try {
        console.log(`Location update for booking ${bookingId}:`, location);
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
          throw new Error('Booking not found');
        }
        
        if (booking.driver.toString() !== socket.userId) {
          throw new Error('Unauthorized');
        }
        
        await trackingService.updateLocation(bookingId, location);
        io.to(bookingId).emit('locationUpdate', location);
      } catch (error) {
        console.error('Update location error:', error);
        socket.emit('error', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

module.exports = setupWebSocket;