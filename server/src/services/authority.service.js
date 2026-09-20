const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');

const ALLOWED_TRANSITIONS = {
  SUBMITTED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'ESCALATED'],
  IN_PROGRESS: ['RESOLVED', 'ESCALATED'],
  RESOLVED: [],
  ESCALATED: []
};

/**
 * Find complaint by string complaintId or ObjectId
 */
const findComplaintByIdentifier = async (identifier) => {
  let complaint = await Complaint.findOne({ complaintId: identifier });
  if (!complaint && mongoose.Types.ObjectId.isValid(identifier)) {
    complaint = await Complaint.findById(identifier);
  }
  return complaint;
};

/**
 * Fetch department complaints with optional filters and stats
 */
exports.getDepartmentComplaints = async (departmentId, filters = {}) => {
  if (!departmentId) {
    const error = new Error('Authority is not assigned to any department');
    error.statusCode = 403;
    throw error;
  }

  const query = { departmentId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.severity) {
    query.severity = filters.severity;
  }

  if (filters.issueType) {
    query.issueType = filters.issueType;
  }

  const complaints = await Complaint.find(query)
    .populate('departmentId', 'code name')
    .populate('assignedTo', 'name email')
    .populate('citizenId', 'name email')
    .sort({ createdAt: -1 });

  // Compute department summary statistics (across all complaints in this department)
  const allDeptComplaints = await Complaint.find({ departmentId }).select('status');
  
  const stats = {
    total: allDeptComplaints.length,
    submitted: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    escalated: 0
  };

  allDeptComplaints.forEach((c) => {
    switch (c.status) {
      case 'SUBMITTED':
        stats.submitted += 1;
        break;
      case 'ASSIGNED':
        stats.assigned += 1;
        break;
      case 'IN_PROGRESS':
        stats.inProgress += 1;
        break;
      case 'RESOLVED':
        stats.resolved += 1;
        break;
      case 'ESCALATED':
        stats.escalated += 1;
        break;
      default:
        break;
    }
  });

  return {
    stats,
    complaints
  };
};

/**
 * Fetch single complaint for authority
 */
exports.getDepartmentComplaintById = async (identifier, authorityUser) => {
  const complaint = await findComplaintByIdentifier(identifier);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Cross-department check: authority must belong to the same department
  if (!complaint.departmentId || !authorityUser.departmentId || !complaint.departmentId.equals(authorityUser.departmentId)) {
    const error = new Error('Not authorized to access complaints for another department');
    error.statusCode = 403;
    throw error;
  }

  await complaint.populate('departmentId', 'code name description contactEmail');
  await complaint.populate('assignedTo', 'name email');
  await complaint.populate('citizenId', 'name email');
  await complaint.populate('statusHistory.changedBy', 'name email role');

  return complaint;
};

/**
 * Update complaint status with strict lifecycle rules
 */
exports.updateComplaintStatus = async (identifier, authorityUser, newStatus, note = '') => {
  const complaint = await findComplaintByIdentifier(identifier);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Cross-department check: authority must belong to the same department
  if (!complaint.departmentId || !authorityUser.departmentId || !complaint.departmentId.equals(authorityUser.departmentId)) {
    const error = new Error('Not authorized to modify complaints for another department');
    error.statusCode = 403;
    throw error;
  }

  const currentStatus = complaint.status;

  // Validate allowed transition
  const validNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!validNextStatuses.includes(newStatus)) {
    const error = new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    error.statusCode = 400;
    throw error;
  }

  // Resolution requires a note
  if (newStatus === 'RESOLVED' && (!note || typeof note !== 'string' || note.trim().length < 5)) {
    const error = new Error('Resolution note is required (minimum 5 characters)');
    error.statusCode = 400;
    throw error;
  }

  // Assignment logic: SUBMITTED -> ASSIGNED assigns to the acting authority
  if (currentStatus === 'SUBMITTED' && newStatus === 'ASSIGNED') {
    complaint.assignedTo = authorityUser._id;
  }

  // Escalation flag update if moved to ESCALATED
  if (newStatus === 'ESCALATED') {
    complaint.escalation = {
      isEscalated: true,
      level: (complaint.escalation?.level || 0) + 1,
      reason: note ? note.trim() : 'Escalated by authority',
      escalatedAt: new Date()
    };
  }

  // Format note
  const formattedNote = note && note.trim() 
    ? note.trim() 
    : (newStatus === 'ASSIGNED' ? 'Assigned to department authority' : `Status updated to ${newStatus}`);

  // Append status history entry
  complaint.statusHistory.push({
    status: newStatus,
    changedBy: authorityUser._id,
    changedByRole: 'authority',
    note: formattedNote,
    timestamp: new Date()
  });

  complaint.status = newStatus;

  await complaint.save();

  await complaint.populate('departmentId', 'code name description');
  await complaint.populate('assignedTo', 'name email');
  await complaint.populate('citizenId', 'name email');
  await complaint.populate('statusHistory.changedBy', 'name email role');

  return complaint;
};
