const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');
const adminValidator = require('../validators/admin.validator');

// All admin routes strictly require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard aggregated metrics
router.get('/dashboard', adminController.getDashboard);

// Complaint operations
router.get('/complaints', adminController.getComplaints);
router.get('/complaints/:complaintId', adminController.getComplaintById);
router.get('/complaints/:complaintId/agent-actions', adminController.getComplaintAgentActions);

// Global Agent Actions audit trace
router.get('/agent-actions', adminController.getAgentActions);

// User management
router.get('/users', adminController.getUsers);

// Authority user management
router.post('/authorities', adminValidator.validateAuthorityCreation, adminController.createAuthority);
router.patch('/authorities/:userId', adminValidator.validateAuthorityUpdate, adminController.updateAuthority);

// Department management
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminValidator.validateDepartmentCreation, adminController.createDepartment);
router.patch('/departments/:departmentId', adminValidator.validateDepartmentUpdate, adminController.updateDepartment);

module.exports = router;
