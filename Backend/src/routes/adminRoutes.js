// src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authentication } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

router.use(authentication);
router.use(isAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/statistics', adminController.getStatistics);
router.get('/users', adminController.getAllUsers);
router.get('/drivers', adminController.getAllDrivers);
router.get('/vehicles', adminController.getAllVehicles);
router.get('/driver-activity', adminController.getDriverActivity);
router.get('/booking-data', adminController.getBookingData);
router.post('/revenue-analytics', adminController.getRevenueAnalytics);
router.get('/fleet', adminController.getFleetData);
router.get('/trip-analytics', adminController.getTripAnalytics);

module.exports = router;