const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadServiceFile } = require('../middleware/upload');

// All service routes require authentication
router.use(auth);

// ============================================
// Dashboard stats
// ============================================
router.get('/dashboard/stats', serviceController.getDashboardStats);

// ============================================
// ✅ Create service (POST) — with optional file upload
// ============================================
router.post(
  '/',
  uploadServiceFile.single('attachment'),
  serviceController.createService
);

// ============================================
// ✅ Get services (GET)
// ============================================
router.get('/', serviceController.getServices);

// ============================================
// ✅ Export routes (must come BEFORE /:id route)
// ============================================
router.get('/:id/export/docx', serviceController.exportServiceDOCX);
router.get('/:id/export/pdf', serviceController.exportServicePDF);

// ============================================
// ✅ Get service by ID (GET)
// ============================================
router.get('/:id', serviceController.getServiceById);

// ============================================
// ✅ Update service (PATCH) — with optional file upload
// ============================================
router.patch(
  '/:id',
  uploadServiceFile.single('attachment'),
  serviceController.updateService
);

// ============================================
// ✅ Delete service (DELETE)
// ============================================
router.delete('/:id', serviceController.deleteService);

module.exports = router;