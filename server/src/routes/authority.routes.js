const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const authorityController = require('../controllers/authority.controller');
const authorityValidator = require('../validators/authority.validator');
const multer = require('multer');

// Setup multer for temporary local storage before moving to Cloudinary
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('Unsupported image format. Allowed formats: jpeg, png, webp');
      err.statusCode = 400;
      cb(err, false);
    }
  }
});

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

// POST /api/v1/authority/complaints/:complaintId/resolution - Submit resolution evidence
router.post(
  '/complaints/:complaintId/resolution',
  upload.single('image'),
  authorityValidator.validateResolution,
  authorityController.submitResolution
);

module.exports = router;
