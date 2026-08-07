const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// All report routes require authentication
router.use(auth);

// ✅ Send daily report (Worker)
router.post('/daily', reportController.sendDailyReport);

// ✅ Get report notifications (Admin)
router.get('/notifications', reportController.getReportNotifications);

// ✅ Mark report notification as read (Admin)
router.patch('/notifications/:id/read', reportController.markReportNotificationRead);

// ✅ Mark all report notifications as read (Admin)
router.patch('/notifications/read-all', reportController.markAllReportNotificationsRead);

// Existing routes
router.post('/generate', reportController.generateReport);
router.get('/', reportController.getReports);
router.get('/:id', reportController.getReportById);
router.get('/:id/download', reportController.downloadReport);
router.delete('/:id', reportController.deleteReport);
router.get('/admin/all', authorize('ADMIN'), reportController.getAllReports);

module.exports = router;