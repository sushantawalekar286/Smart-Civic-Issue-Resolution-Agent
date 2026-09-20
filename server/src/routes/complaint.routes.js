const express = require('express');
const multer = require('multer');
const { protect, requireRole, authorize } = require('../middleware/auth.middleware');
const complaintController = require('../controllers/complaint.controller');
const { validateComplaintIntake } = require('../validators/complaint.validator');

const router = express.Router();

// Setup multer for temporary local storage before moving to Cloudinary
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Intake endpoint (Step 3/4): analyze intake payload and run AI analysis
router.post('/analyze', protect, authorize('citizen'), upload.single('image'), validateComplaintIntake, complaintController.analyzeIntake);

/**
 * @route POST /api/v1/complaints
 * @desc Submit a final complaint using an analysis token
 * @access Private (Citizen)
 */
router.post('/', protect, requireRole('citizen'), complaintController.submitComplaint);

module.exports = router;
