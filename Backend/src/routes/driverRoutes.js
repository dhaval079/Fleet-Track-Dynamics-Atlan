const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authentication } = require('../middleware/authMiddleware');

router.use(authentication);

router.get('/', driverController.getAllDrivers);
router.get('/available', driverController.getAvailableDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', driverController.createDriver);
// router.put('/:id', driverController.updateDriver);
router.post('/update-location/:id', driverController.updateDriverLocation);
// New route for getting driver's current location
router.get('/current-location/:id', driverController.getDriverLocationByBookingId);
router.put('/:id/availability', driverController.updateDriverAvailability);
// router.delete('/:id', driverController.deleteDriver);
router.post('/current-jobs', driverController.getDriverBookings);
router.put('/jobs/:id/status', driverController.updateJobStatus);

module.exports = router;