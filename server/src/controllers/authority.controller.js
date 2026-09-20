const authorityService = require('../services/authority.service');

/**
 * GET /api/v1/authority/complaints
 * Returns complaints for the authenticated authority's department with optional filters
 */
exports.getComplaints = async (req, res, next) => {
  try {
    const { status, severity, issueType } = req.query;
    const departmentId = req.user.departmentId;

    if (!departmentId) {
      return res.status(403).json({ error: 'Authority user is not associated with any department' });
    }

    const result = await authorityService.getDepartmentComplaints(departmentId, {
      status,
      severity,
      issueType
    });

    res.status(200).json({
      success: true,
      count: result.complaints.length,
      stats: result.stats,
      data: result.complaints
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * GET /api/v1/authority/complaints/:complaintId
 * Returns full complaint details for the authority's department
 */
exports.getComplaintById = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const complaint = await authorityService.getDepartmentComplaintById(complaintId, req.user);

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

/**
 * PATCH /api/v1/authority/complaints/:complaintId/status
 * Updates complaint status with strict lifecycle rules and records status history
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, note } = req.body;

    const updatedComplaint = await authorityService.updateComplaintStatus(
      complaintId,
      req.user,
      status,
      note
    );

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: updatedComplaint
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};
