const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');
const AgentAction = require('../models/AgentAction');

/**
 * Helper to find a complaint by either string complaintId or ObjectId
 */
const findComplaint = async (identifier) => {
  let complaint = await Complaint.findOne({ complaintId: identifier });
  if (!complaint && mongoose.Types.ObjectId.isValid(identifier)) {
    complaint = await Complaint.findById(identifier);
  }
  return complaint;
};

/**
 * GET /api/v1/admin/complaints
 * Returns paginated complaints across all departments with multi-field filtering
 */
exports.getComplaints = async (filters = {}, pagination = {}) => {
  const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(pagination.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.status) {
    query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
  }

  if (filters.severity) {
    query.severity = filters.severity;
  }

  if (filters.issueType) {
    query.issueType = filters.issueType;
  }

  if (filters.departmentId) {
    if (mongoose.Types.ObjectId.isValid(filters.departmentId)) {
      query.departmentId = filters.departmentId;
    }
  }

  if (filters.search) {
    query.$or = [
      { complaintId: { $regex: filters.search.trim(), $options: 'i' } },
      { description: { $regex: filters.search.trim(), $options: 'i' } }
    ];
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  const total = await Complaint.countDocuments(query);
  const complaints = await Complaint.find(query)
    .populate('departmentId', 'code name')
    .populate('citizenId', 'name email phone')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    complaints
  };
};

/**
 * GET /api/v1/admin/complaints/:complaintId
 * Returns full details for a single complaint
 */
exports.getComplaintById = async (identifier) => {
  const complaint = await findComplaint(identifier);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  await complaint.populate('departmentId', 'code name description contactEmail escalationDepartmentId');
  await complaint.populate('citizenId', 'name email phone avatarUrl');
  await complaint.populate('assignedTo', 'name email phone');
  await complaint.populate('statusHistory.changedBy', 'name email role');

  return complaint;
};

/**
 * GET /api/v1/admin/agent-actions
 * Query agent actions across complaints with filters & pagination
 */
exports.getAgentActions = async (filters = {}, pagination = {}) => {
  const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(pagination.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.actionType) {
    query.actionType = filters.actionType;
  }

  if (filters.complaintId) {
    const complaint = await findComplaint(filters.complaintId);
    if (complaint) {
      query.complaintId = complaint._id;
    } else if (mongoose.Types.ObjectId.isValid(filters.complaintId)) {
      query.complaintId = filters.complaintId;
    } else {
      // If complaint doesn't exist, return empty result
      return {
        pagination: { page, limit, total: 0, pages: 0 },
        actions: []
      };
    }
  }

  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) {
      query.timestamp.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.timestamp.$lte = new Date(filters.endDate);
    }
  }

  const total = await AgentAction.countDocuments(query);
  const actions = await AgentAction.find(query)
    .populate('complaintId', 'complaintId issueType status departmentId')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

  return {
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    actions
  };
};

/**
 * GET /api/v1/admin/complaints/:complaintId/agent-actions
 * Chronological timeline of all agent actions for a single complaint
 */
exports.getComplaintAgentActions = async (identifier) => {
  const complaint = await findComplaint(identifier);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  const actions = await AgentAction.find({ complaintId: complaint._id })
    .sort({ timestamp: 1 }); // Chronological order

  return {
    complaintId: complaint.complaintId,
    count: actions.length,
    actions
  };
};

/**
 * GET /api/v1/admin/users
 * Returns safe user list with role, active status, and search filters
 */
exports.getUsers = async (filters = {}, pagination = {}) => {
  const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(pagination.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.isActive !== undefined && filters.isActive !== '') {
    query.isActive = filters.isActive === 'true' || filters.isActive === true;
  }

  if (filters.search) {
    const regex = { $regex: filters.search.trim(), $options: 'i' };
    query.$or = [{ name: regex }, { email: regex }];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-passwordHash')
    .populate('departmentId', 'code name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    users
  };
};

/**
 * POST /api/v1/admin/authorities
 * Admin creation of department authority accounts
 */
exports.createAuthority = async (data) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Validate department exists and is active
  const department = await Department.findById(data.departmentId);
  if (!department || !department.isActive) {
    const error = new Error('Invalid or inactive department');
    error.statusCode = 400;
    throw error;
  }

  // Check email uniqueness
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const authority = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'authority',
    departmentId: department._id,
    phone: data.phone ? data.phone.trim() : null
  });

  return {
    _id: authority._id,
    name: authority.name,
    email: authority.email,
    role: authority.role,
    departmentId: authority.departmentId,
    phone: authority.phone,
    isActive: authority.isActive,
    createdAt: authority.createdAt
  };
};

/**
 * PATCH /api/v1/admin/authorities/:userId
 * Update authority user fields (disallowing role escalation)
 */
exports.updateAuthority = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user || user.role !== 'authority') {
    const error = new Error('Authority user not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.departmentId) {
    const department = await Department.findById(data.departmentId);
    if (!department || !department.isActive) {
      const error = new Error('Invalid or inactive department');
      error.statusCode = 400;
      throw error;
    }
    user.departmentId = department._id;
  }

  if (data.name) {
    user.name = data.name.trim();
  }

  if (data.phone !== undefined) {
    user.phone = data.phone ? data.phone.trim() : null;
  }

  if (data.isActive !== undefined) {
    user.isActive = Boolean(data.isActive);
  }

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
    phone: user.phone,
    isActive: user.isActive,
    updatedAt: user.updatedAt
  };
};

/**
 * GET /api/v1/admin/departments
 * List all departments
 */
exports.getDepartments = async () => {
  return await Department.find()
    .populate('escalationDepartmentId', 'code name')
    .sort({ name: 1 });
};

/**
 * POST /api/v1/admin/departments
 * Create a new department
 */
exports.createDepartment = async (data) => {
  const code = data.code.toUpperCase().trim();

  const existingDept = await Department.findOne({ code });
  if (existingDept) {
    const error = new Error('Department code already exists');
    error.statusCode = 400;
    throw error;
  }

  if (data.escalationDepartmentId) {
    const escDept = await Department.findById(data.escalationDepartmentId);
    if (!escDept) {
      const error = new Error('Escalation department not found');
      error.statusCode = 400;
      throw error;
    }
  }

  return await Department.create({
    code,
    name: data.name.trim(),
    description: data.description ? data.description.trim() : '',
    issueTypes: data.issueTypes || [],
    contactEmail: data.contactEmail ? data.contactEmail.trim().toLowerCase() : null,
    escalationDepartmentId: data.escalationDepartmentId || null,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
  });
};

/**
 * PATCH /api/v1/admin/departments/:departmentId
 * Update department configuration
 */
exports.updateDepartment = async (departmentId, data) => {
  let department = await Department.findById(departmentId);
  if (!department && typeof departmentId === 'string') {
    department = await Department.findOne({ code: departmentId.toUpperCase() });
  }

  if (!department) {
    const error = new Error('Department not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.escalationDepartmentId !== undefined) {
    if (data.escalationDepartmentId) {
      if (department._id.toString() === data.escalationDepartmentId.toString()) {
        const error = new Error('Department cannot escalate to itself');
        error.statusCode = 400;
        throw error;
      }
      const escDept = await Department.findById(data.escalationDepartmentId);
      if (!escDept) {
        const error = new Error('Escalation department not found');
        error.statusCode = 400;
        throw error;
      }
      department.escalationDepartmentId = escDept._id;
    } else {
      department.escalationDepartmentId = null;
    }
  }

  if (data.name) {
    department.name = data.name.trim();
  }

  if (data.description !== undefined) {
    department.description = data.description.trim();
  }

  if (data.issueTypes) {
    department.issueTypes = data.issueTypes;
  }

  if (data.contactEmail !== undefined) {
    department.contactEmail = data.contactEmail ? data.contactEmail.trim().toLowerCase() : null;
  }

  if (data.isActive !== undefined) {
    department.isActive = Boolean(data.isActive);
  }

  await department.save();
  return department;
};

/**
 * GET /api/v1/admin/dashboard
 * Aggregated operational metrics across complaints, agent actions, and users
 */
exports.getDashboardStats = async () => {
  // 1. Complaint status breakdown
  const statusCounts = await Complaint.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const stats = {
    total: 0,
    submitted: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    escalated: 0
  };

  statusCounts.forEach(({ _id, count }) => {
    stats.total += count;
    switch (_id) {
      case 'SUBMITTED': stats.submitted = count; break;
      case 'ASSIGNED': stats.assigned = count; break;
      case 'IN_PROGRESS': stats.inProgress = count; break;
      case 'RESOLVED': stats.resolved = count; break;
      case 'ESCALATED': stats.escalated = count; break;
      default: break;
    }
  });

  // 2. Severity breakdown
  const severityCounts = await Complaint.aggregate([
    { $group: { _id: "$severity", count: { $sum: 1 } } }
  ]);

  const severityStats = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0
  };

  severityCounts.forEach(({ _id, count }) => {
    if (severityStats[_id] !== undefined) {
      severityStats[_id] = count;
    }
  });

  // 3. Department complaint volume
  const departmentVolume = await Complaint.aggregate([
    { $group: { _id: "$departmentId", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "department"
      }
    },
    { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        departmentId: "$_id",
        code: "$department.code",
        name: "$department.name",
        count: 1
      }
    }
  ]);

  // 4. Agent Actions metrics
  const totalAgentActions = await AgentAction.countDocuments();
  const followUpsInitiated = await AgentAction.countDocuments({ actionType: 'FOLLOW_UP_INITIATED' });
  const escalationsInitiated = await AgentAction.countDocuments({ actionType: 'ESCALATION_INITIATED' });

  // 5. User metrics
  const totalUsers = await User.countDocuments();
  const citizenCount = await User.countDocuments({ role: 'citizen' });
  const authorityCount = await User.countDocuments({ role: 'authority' });
  const adminCount = await User.countDocuments({ role: 'admin' });

  // 6. Recent activity
  const recentComplaints = await Complaint.find()
    .select('complaintId issueType severity status submittedAt createdAt')
    .populate('departmentId', 'code name')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentAgentActions = await AgentAction.find()
    .populate('complaintId', 'complaintId status')
    .sort({ timestamp: -1 })
    .limit(5);

  return {
    complaints: {
      ...stats,
      unresolved: stats.submitted + stats.assigned + stats.inProgress + stats.escalated,
      severity: severityStats,
      byDepartment: departmentVolume
    },
    agentActions: {
      total: totalAgentActions,
      followUpsInitiated,
      escalationsInitiated,
      recent: recentAgentActions
    },
    users: {
      total: totalUsers,
      citizens: citizenCount,
      authorities: authorityCount,
      admins: adminCount
    },
    recentComplaints
  };
};
