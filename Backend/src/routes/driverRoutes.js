const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authentication } = require('../middleware/authMiddleware');

router.use(authentication);

router.get('/', driverController.getAllDrivers);
router.get('/available', driverController.getAvailableDrivers);
router.get('/:id', driverController.getDriverById);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.put('/:id/location', driverController.updateDriverLocation);
router.put('/:id/availability', driverController.updateDriverAvailability);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;