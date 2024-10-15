// src/websockets/trackingSocket.js

const socketIo = require('socket.io');
const trackingService = require('../services/trackingService');

function setupWebSocket(server) {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('subscribe', (bookingId) => {
      socket.join(bookingId);
      console.log(`Client subscribed to booking ${bookingId}`);
    });

    socket.on('unsubscribe', (bookingId) => {
      socket.leave(bookingId);
      console.log(`Client unsubscribed from booking ${bookingId}`);
    });

    socket.on('updateLocation', async ({ bookingId, location }) => {
      try {
        await trackingService.updateLocation(bookingId, location);
        io.to(bookingId).emit('locationUpdate', location);
        console.log(`Location updated for booking ${bookingId}: ${JSON.stringify(location)}`);
      } catch (error) {
        console.error(`Error updating location for booking ${bookingId}:`, error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

module.exports = setupWebSocket;