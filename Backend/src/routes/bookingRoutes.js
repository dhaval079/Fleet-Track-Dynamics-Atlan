const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authentication } = require('../middleware/authMiddleware');

router.use(authentication);

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.post('/userbookings', bookingController.getUserBookings);
router.put('/:id/status', bookingController.updateBookingStatus);
router.delete('/:id', bookingController.deleteBooking);
router.post('/:id/track', bookingController.startTracking);
router.get('/:id/location', bookingController.getLocation);
router.post('/:id/location', bookingController.updateLocation);

module.exports = router;