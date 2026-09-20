const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const authorityController = require('../controllers/authority.controller');
const authorityValidator = require('../validators/authority.validator');

// All authority routes require authentication and authority role
router.use(protect);
router.use(authorize('authority'));

// GET /api/v1/authority/complaints - List department complaints
router.get(
  '/complaints',
  authorityValidator.validateComplaintQuery,
  authorityController.getComplaints
);

// GET /api/v1/authority/complaints/:complaintId - Get single complaint details
router.get(
  '/complaints/:complaintId',
  authorityController.getComplaintById
);

// PATCH /api/v1/authority/complaints/:complaintId/status - Update complaint status
router.patch(
  '/complaints/:complaintId/status',
  authorityValidator.validateStatusUpdate,
  authorityController.updateStatus
);

module.exports = router;
