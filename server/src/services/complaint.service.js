const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

/**
 * Helper to find complaint by complaintId (string) or ObjectId
 */
const findComplaintByIdentifier = async (identifier) => {
  let complaint = await Complaint.findOne({ complaintId: identifier });
  if (!complaint && mongoose.Types.ObjectId.isValid(identifier)) {
    complaint = await Complaint.findById(identifier);
  }
  return complaint;
};

/**
 * Get all complaints belonging to a specific citizen
 * @param {string} citizenId 
 * @param {Object} filters 
 * @returns {Promise<Array>}
 */
const getCitizenComplaints = async (citizenId, filters = {}) => {
  const query = {
    citizenId: new mongoose.Types.ObjectId(citizenId)
  };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.severity) {
    query.severity = filters.severity;
  }

  const complaints = await Complaint.find(query)
    .populate('departmentId', 'code name description')
    .sort({ createdAt: -1 });

  return complaints.map(complaint => {
    const doc = complaint.toObject();
    return {
      ...doc,
      department: doc.departmentId ? doc.departmentId.name : doc.aiAnalysis?.departmentAnalysis?.departmentName || 'General'
    };
  });
};

/**
 * Get single complaint by ID with authorization check
 * @param {string} identifier 
 * @param {Object} user - The authenticated req.user
 * @returns {Promise<Object>}
 */
const getComplaintById = async (identifier, user) => {
  const complaint = await findComplaintByIdentifier(identifier);

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization Check:
  // Admin can view any complaint
  // Authority can view complaint if it belongs to their department
  // Citizen can ONLY view their own complaint
  if (user.role === 'citizen') {
    if (complaint.citizenId.toString() !== user._id.toString()) {
      const error = new Error('Not authorized to access this complaint');
      error.statusCode = 403;
      throw error;
    }
  } else if (user.role === 'authority') {
    if (!user.departmentId || !complaint.departmentId || !complaint.departmentId.equals(user.departmentId)) {
      const error = new Error('Not authorized to access complaints for another department');
      error.statusCode = 403;
      throw error;
    }
  }
  // Admin bypasses ownership/dept checks

  await complaint.populate('departmentId', 'code name description contactEmail');
  await complaint.populate('assignedTo', 'name email');
  await complaint.populate('statusHistory.changedBy', 'name email role');

  const doc = complaint.toObject();
  return {
    ...doc,
    department: doc.departmentId ? doc.departmentId.name : doc.aiAnalysis?.departmentAnalysis?.departmentName || 'General'
  };
};

module.exports = {
  getCitizenComplaints,
  getComplaintById
};
