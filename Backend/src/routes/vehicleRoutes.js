const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authentication } = require('../middleware/authMiddleware');

router.use(authentication);

router.get('/', vehicleController.getAllVehicles);
router.get('/available', vehicleController.getAvailableVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', vehicleController.createVehicle);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.get('/driver/:driverId', vehicleController.getVehiclesByDriver);
module.exports = router;