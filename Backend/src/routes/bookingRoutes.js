const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authentication } = require('../middleware/authMiddleware');

router.use(authentication);

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id/status', bookingController.updateBookingStatus);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;