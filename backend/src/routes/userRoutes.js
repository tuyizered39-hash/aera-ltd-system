const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadProfile } = require('../middleware/upload');

// Admin routes
router.post('/workers', auth, authorize('ADMIN'), validate(schemas.createUser), userController.createWorker);
router.get('/workers', auth, authorize('ADMIN'), userController.getWorkers);
router.patch('/workers/:id', auth, authorize('ADMIN'), userController.updateWorker);
router.delete('/workers/:id', auth, authorize('ADMIN'), userController.deleteWorker);
router.patch('/workers/:id/password', auth, authorize('ADMIN'), userController.changeWorkerPassword);

// User routes
router.patch('/profile', auth, userController.updateProfile);
router.post('/profile-picture', auth, uploadProfile.single('profilePicture'), userController.uploadProfilePicture);

module.exports = router;