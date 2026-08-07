const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(auth);

// Get dashboard stats
router.get('/stats', dashboardController.getStats);

// Get monthly report
router.get('/monthly', dashboardController.getMonthlyReport);

// Get daily report
router.get('/daily', dashboardController.getDailyReport);

// Admin only
router.get('/admin/overview', dashboardController.getAdminOverview);

module.exports = router;