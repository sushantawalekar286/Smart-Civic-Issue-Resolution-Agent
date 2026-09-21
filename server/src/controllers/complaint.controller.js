const fs = require('fs');
const mongoose = require('mongoose');
const storageService = require('../services/storage.service');
const Complaint = require('../models/Complaint');
const AgentAction = require('../models/AgentAction');
const complaintSubmissionService = require('../services/complaintSubmission.service');
const analysisTokenService = require('../services/analysisToken.service');
const agentOrchestrator = require('../services/ai/agentOrchestrator.service');

exports.analyzeIntake = async (req, res, next) => {
  try {
    const { description, location } = req.body;
    let parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    
    let evidence = [];
    let inputMethod = 'text';

    if (req.file) {
      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          try {
            await fs.promises.unlink(req.file.path);
          } catch (_) {}
        }
        res.status(400);
        throw new Error('Unsupported image format.');
      }

      // Real upload to Cloudinary (cleans up temp file automatically)
      const uploadResult = await storageService.uploadImage(req.file.path);
      
      evidence.push({
        type: 'image',
        url: uploadResult.url,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        publicId: uploadResult.publicId
      });
      inputMethod = 'mixed';
    }

    const payload = {
      description: description.trim(),
      inputMethod,
      location: {
        latitude: parseFloat(parsedLocation.latitude),
        longitude: parseFloat(parsedLocation.longitude),
        address: parsedLocation.address || ""
      },
      evidence
    };

    // Execute AI Complaint Analysis Pipeline (Step 4)
    const aiAnalysis = await agentOrchestrator.analyzeComplaint(payload);

    let analysisToken = null;
    if (req.user && req.user._id) {
      analysisToken = analysisTokenService.generateToken(req.user._id.toString(), payload, aiAnalysis);
    }

    res.status(200).json({
      success: true,
      data: {
        ...payload,
        aiAnalysis,
        analysisData: aiAnalysis,
        analysisToken
      }
    });
  } catch (error) {
    // If temp file remains on unexpected failure, clean up
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (_) {}
    }

    console.error('AI complaint analysis failed:', error.message);
    let statusCode = error.statusCode || 500;
    if (res.statusCode && res.statusCode !== 200) {
      statusCode = res.statusCode;
    }
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'AI analysis temporarily unavailable',
      message: error.message || 'AI analysis temporarily unavailable',
      code: error.code || 'AI_ANALYSIS_FAILED'
    });
  }
};

exports.submitComplaint = async (req, res, next) => {
  try {
    const { analysisToken } = req.body;
    
    if (!analysisToken) {
      return res.status(400).json({
        success: false,
        error: 'Analysis token is required',
        message: 'Analysis token is required'
      });
    }

    const result = await complaintSubmissionService.submitComplaint(analysisToken, req.user._id.toString());

    res.status(201).json(result);
  } catch (error) {
    let statusCode = error.statusCode || 500;

    if (error.message.includes('Token does not belong')) {
      statusCode = 403;
    } else if (error.message.includes('Department not found')) {
      statusCode = 404;
    } else if (error.message.includes('already been submitted')) {
      statusCode = 409;
    } else if (
      error.message.includes('Analysis token expired') ||
      error.message.includes('Invalid analysis token signature') ||
      error.message.includes('Malformed token') ||
      error.message.includes('Invalid token type') ||
      error.message.includes('Missing department') ||
      error.message.includes('Invalid complaint')
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: error.message,
      message: error.message
    });
  }
};

/**
 * GET /api/v1/complaints
 * GET /api/v1/complaints/my
 * Returns all complaints submitted by the authenticated citizen
 */
exports.getMyComplaints = async (req, res, next) => {
  try {
    const citizenId = req.user._id;

    const complaints = await Complaint.find({ citizenId })
      .sort({ createdAt: -1 })
      .populate('departmentId', 'code name description');

    const formattedComplaints = complaints.map(c => {
      const obj = c.toObject();
      obj.department = obj.departmentId?.name || obj.department || '';
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      data: formattedComplaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/complaints/:complaintId
 * Returns full details for a complaint with role-based access control
 */
exports.getComplaintById = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    let complaint = await Complaint.findOne({ complaintId });
    if (!complaint && mongoose.Types.ObjectId.isValid(complaintId)) {
      complaint = await Complaint.findById(complaintId);
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Role-based access control
    const role = (req.user?.role || '').toLowerCase();
    if (role === 'citizen') {
      if (!complaint.citizenId || !complaint.citizenId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this complaint'
        });
      }
    } else if (role === 'authority') {
      if (!req.user.departmentId || !complaint.departmentId || !complaint.departmentId.equals(req.user.departmentId)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view complaints of another department'
        });
      }
    }

    await complaint.populate('departmentId', 'code name description contactEmail');
    await complaint.populate('citizenId', 'name email phone avatarUrl');
    await complaint.populate('assignedTo', 'name email phone');
    await complaint.populate('statusHistory.changedBy', 'name email role');

    const formatted = complaint.toObject();
    formatted.department = formatted.departmentId?.name || formatted.department || '';

    // Provide flat accessor shortcuts for frontend components
    if (formatted.aiAnalysis) {
      formatted.aiAnalysis.classificationConfidence =
        formatted.aiAnalysis.classification?.confidence ?? formatted.aiAnalysis.classificationConfidence ?? null;
      formatted.aiAnalysis.severityReason =
        formatted.aiAnalysis.severityAnalysis?.reason ?? formatted.aiAnalysis.severityReason ?? '';
      formatted.aiAnalysis.departmentReason =
        formatted.aiAnalysis.departmentAnalysis?.reason ?? formatted.aiAnalysis.departmentReason ?? '';
    }

    res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/complaints/:complaintId/agent-actions
 * Returns all AgentAction records for a given complaint (Admin & assigned Authority)
 */
exports.getComplaintAgentActions = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    let complaint = await Complaint.findOne({ complaintId });
    if (!complaint && mongoose.Types.ObjectId.isValid(complaintId)) {
      complaint = await Complaint.findById(complaintId);
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    // Role-based access control:
    // Admin has access to all complaints
    // Authority has access only if complaint belongs to their department
    if (req.user.role === 'authority') {
      if (!req.user.departmentId || !complaint.departmentId || !complaint.departmentId.equals(req.user.departmentId)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access agent actions for another department'
        });
      }
    }

    const actions = await AgentAction.find({ complaintId: complaint._id })
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      complaintId: complaint.complaintId,
      count: actions.length,
      data: actions
    });
  } catch (error) {
    next(error);
  }
};
