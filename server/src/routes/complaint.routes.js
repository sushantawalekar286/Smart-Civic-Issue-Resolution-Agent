const express = require('express');
const multer = require('multer');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { analyzeIntake } = require('../controllers/complaint.controller');
const { validateComplaintIntake } = require('../validators/complaint.validator');

const router = express.Router();

// Setup multer for temporary local storage before moving to Cloudinary
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// The endpoint is an intake contract for step 3. 
// Uses multer first to parse multipart data, then validates text fields, then processes intake.
router.post('/analyze', protect, requireRole('citizen'), upload.single('image'), validateComplaintIntake, analyzeIntake);

module.exports = router;
