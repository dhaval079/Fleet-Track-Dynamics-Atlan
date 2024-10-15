const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authentication } = require('../middleware/authMiddleware');


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', authentication, authController.getMe);

module.exports = router;