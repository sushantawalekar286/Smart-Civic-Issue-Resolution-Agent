const adminService = require('../services/admin.service');

/**
 * GET /api/v1/admin/complaints
 */
exports.getComplaints = async (req, res, next) => {
  try {
    const { status, severity, issueType, departmentId, search, startDate, endDate, page, limit } = req.query;
    
    const result = await adminService.getComplaints(
      { status, severity, issueType, departmentId, search, startDate, endDate },
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: result.complaints,
      complaints: result.complaints,
      pagination: result.pagination
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * GET /api/v1/admin/complaints/:complaintId
 */
exports.getComplaintById = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const complaint = await adminService.getComplaintById(complaintId);

    res.status(200).json({
      success: true,
      data: complaint,
      complaint
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * GET /api/v1/admin/agent-actions
 */
exports.getAgentActions = async (req, res, next) => {
  try {
    const { actionType, complaintId, startDate, endDate, page, limit } = req.query;

    const result = await adminService.getAgentActions(
      { actionType, complaintId, startDate, endDate },
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: result.actions,
      actions: result.actions,
      pagination: result.pagination
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * GET /api/v1/admin/complaints/:complaintId/agent-actions
 */
exports.getComplaintAgentActions = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const result = await adminService.getComplaintAgentActions(complaintId);

    res.status(200).json({
      success: true,
      ...result,
      data: result.actions
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * GET /api/v1/admin/users
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page, limit } = req.query;

    const result = await adminService.getUsers(
      { role, isActive, search },
      { page, limit }
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * POST /api/v1/admin/authorities
 */
exports.createAuthority = async (req, res, next) => {
  try {
    const { name, email, password, departmentId, phone } = req.body;

    const authority = await adminService.createAuthority({
      name,
      email,
      password,
      departmentId,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Authority user created successfully',
      data: authority
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/authorities/:userId
 */
exports.updateAuthority = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, phone, departmentId, isActive } = req.body;

    const updatedAuthority = await adminService.updateAuthority(userId, {
      name,
      phone,
      departmentId,
      isActive
    });

    res.status(200).json({
      success: true,
      message: 'Authority user updated successfully',
      data: updatedAuthority
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * GET /api/v1/admin/departments
 */
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await adminService.getDepartments();

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * POST /api/v1/admin/departments
 */
exports.createDepartment = async (req, res, next) => {
  try {
    const { code, name, description, issueTypes, contactEmail, escalationDepartmentId, isActive } = req.body;

    const department = await adminService.createDepartment({
      code,
      name,
      description,
      issueTypes,
      contactEmail,
      escalationDepartmentId,
      isActive
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/departments/:departmentId
 */
exports.updateDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { name, description, issueTypes, contactEmail, escalationDepartmentId, isActive } = req.body;

    const department = await adminService.updateDepartment(departmentId, {
      name,
      description,
      issueTypes,
      contactEmail,
      escalationDepartmentId,
      isActive
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};
