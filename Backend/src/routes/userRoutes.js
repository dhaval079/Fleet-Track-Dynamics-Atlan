const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authentication } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authentication);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;