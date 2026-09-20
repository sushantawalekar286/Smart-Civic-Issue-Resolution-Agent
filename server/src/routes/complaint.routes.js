const { protect, requireRole } = require('../middleware/auth.middleware');
const complaintController = require('../controllers/complaint.controller');
const express = require('express');

const router = express.Router();

/**
 * @route POST /api/v1/complaints
 * @desc Submit a final complaint using an analysis token
 * @access Private (Citizen)
 */
router.post('/', protect, requireRole('citizen'), complaintController.submitComplaint);

module.exports = router;
