const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.get('/me', auth, authController.getMe);
router.post('/change-password', auth, authController.changePassword);

module.exports = router;