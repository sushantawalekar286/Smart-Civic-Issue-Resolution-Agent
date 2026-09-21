const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth.middleware');
const complaintController = require('../controllers/complaint.controller');
const { validateComplaintIntake } = require('../validators/complaint.validator');

const router = express.Router();

// Setup multer for temporary local storage before moving to Cloudinary
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('Unsupported image format.');
      err.statusCode = 400;
      cb(err, false);
    }
  }
});

// Intake endpoint (Step 3/4): analyze intake payload and run AI analysis
router.post('/analyze', protect, authorize('citizen'), upload.single('image'), validateComplaintIntake, complaintController.analyzeIntake);

/**
 * @route POST /api/v1/complaints
 * @desc Submit a final complaint using an analysis token
 * @access Private (Citizen)
 */
router.post('/', protect, authorize('citizen'), complaintController.submitComplaint);

/**
 * @route GET /api/v1/complaints
 * @route GET /api/v1/complaints/my
 * @desc Get authenticated citizen's complaints
 * @access Private (Citizen)
 */
router.get('/', protect, authorize('citizen'), complaintController.getMyComplaints);
router.get('/my', protect, authorize('citizen'), complaintController.getMyComplaints);

/**
 * @route GET /api/v1/complaints/:complaintId/agent-actions
 * @desc Get all agent actions for a complaint (Admin & Authority)
 * @access Private (Authority, Admin)
 */
router.get('/:complaintId/agent-actions', protect, authorize('authority', 'admin'), complaintController.getComplaintAgentActions);

/**
 * @route GET /api/v1/complaints/:complaintId
 * @desc Get details of a single complaint
 * @access Private (Citizen owner, department Authority, or Admin)
 */
router.get('/:complaintId', protect, complaintController.getComplaintById);

module.exports = router;
