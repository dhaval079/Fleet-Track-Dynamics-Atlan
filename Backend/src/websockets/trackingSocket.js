// src/websockets/trackingSocket.js

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');
const trackingService = require('../services/trackingService');

function setupWebSocket(server) {
  const io = socketIo(server);

  io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      try {
        const decoded = jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    } else {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('subscribe', async (bookingId) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', 'Booking not found');
          return;
        }
        if (booking.user.toString() !== socket.userId && booking.driver.toString() !== socket.userId) {
          socket.emit('error', 'Unauthorized');
          return;
        }
        socket.join(bookingId);
        console.log(`Client ${socket.id} subscribed to booking ${bookingId}`);
      } catch (error) {
        console.error('Error in subscribe:', error);
        socket.emit('error', 'Server error');
      }
    });

    socket.on('updateLocation', async ({ bookingId, location }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', 'Booking not found');
          return;
        }
        if (booking.driver.toString() !== socket.userId) {
          socket.emit('error', 'Unauthorized');
          return;
        }
        await trackingService.updateLocation(bookingId, location);
        io.to(bookingId).emit('locationUpdate', location);
        console.log(`Location updated for booking ${bookingId}: ${JSON.stringify(location)}`);
      } catch (error) {
        console.error('Error in updateLocation:', error);
        socket.emit('error', 'Server error');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
  });

  return io;
}

module.exports = setupWebSocket;