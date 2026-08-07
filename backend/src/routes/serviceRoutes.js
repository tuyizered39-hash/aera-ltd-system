const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All service routes require authentication
router.use(auth);

// ✅ Dashboard stats
router.get('/dashboard/stats', serviceController.getDashboardStats);

// ✅ Create service (POST)
router.post('/', validate(schemas.createService), serviceController.createService);

// ✅ Get services (GET)
router.get('/', serviceController.getServices);

// ✅ Get service by ID (GET)
router.get('/:id', serviceController.getServiceById);

// ✅ Update service (PATCH)
router.patch('/:id', serviceController.updateService);

// ✅ Delete service (DELETE)
router.delete('/:id', serviceController.deleteService);

module.exports = router;