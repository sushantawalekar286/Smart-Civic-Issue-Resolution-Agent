const crypto = require('crypto');
const mongoose = require('mongoose');
const analysisTokenService = require('./analysisToken.service');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const AgentAction = require('../models/AgentAction');
const generateComplaintId = require('../utils/generateComplaintId');

const VALID_ISSUE_TYPES = [
  "Pothole",
  "Road Damage",
  "Garbage",
  "Damaged Streetlight",
  "Water Leakage",
  "Drainage",
  "Public Infrastructure Damage",
  "Other"
];

const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

class ComplaintSubmissionService {
  /**
   * Submit a final complaint based on a validated analysis token.
   * @param {string} analysisToken - Signed JWT token from Step 4
   * @param {string} citizenId - The authenticated citizen ID
   * @returns {Object} Finalized complaint data
   */
  async submitComplaint(analysisToken, citizenId) {
    if (!analysisToken) {
      const err = new Error('Analysis token is required for submission');
      err.statusCode = 400;
      throw err;
    }

    // 1. Verify token signature, expiration, type, and citizen ownership
    let decoded;
    try {
      decoded = analysisTokenService.verifyToken(analysisToken, citizenId);
    } catch (tokenErr) {
      if (tokenErr.message.includes('Token does not belong')) {
        tokenErr.statusCode = 403;
      } else {
        tokenErr.statusCode = 400;
      }
      throw tokenErr;
    }

    // 2. Prevent duplicate submission of the same analysis token
    const tokenHash = crypto.createHash('sha256').update(analysisToken).digest('hex');
    const duplicateAction = await AgentAction.findOne({
      actionType: 'COMPLAINT_SUBMITTED',
      'metadata.tokenHash': tokenHash
    });

    if (duplicateAction) {
      const err = new Error('This analysis token has already been submitted');
      err.statusCode = 409;
      throw err;
    }

    // 3. Recover standardized input and validated AI analysis
    const { input, analysis } = decoded;

    if (!input || typeof input !== 'object' || !analysis || typeof analysis !== 'object') {
      const err = new Error('Malformed token payload');
      err.statusCode = 400;
      throw err;
    }

    if (!input.description || typeof input.description !== 'string' || !input.description.trim()) {
      const err = new Error('Invalid complaint description in analysis token');
      err.statusCode = 400;
      throw err;
    }

    if (!input.location || typeof input.location !== 'object') {
      const err = new Error('Invalid complaint location in analysis token');
      err.statusCode = 400;
      throw err;
    }

    const lat = Number(input.location.latitude ?? input.location.lat);
    const lng = Number(input.location.longitude ?? input.location.lng);

    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
      const err = new Error('Invalid location coordinates in analysis token');
      err.statusCode = 400;
      throw err;
    }

    // 4. Resolve department from the validated department code
    const deptCode = analysis.department?.code || (typeof analysis.department === 'string' ? analysis.department : null);
    if (!deptCode) {
      const err = new Error('Missing department mapping in analysis result');
      err.statusCode = 400;
      throw err;
    }

    const department = await Department.findOne({
      code: deptCode.toUpperCase()
    });

    if (!department) {
      const err = new Error(`Department not found for code: ${deptCode}`);
      err.statusCode = 404;
      throw err;
    }

    // 5. Generate human-readable unique complaintId with retry on collision
    let complaintId;
    let attempts = 0;
    while (!complaintId && attempts < 5) {
      attempts++;
      const candidateId = await generateComplaintId(Complaint);
      const exists = await Complaint.findOne({ complaintId: candidateId });
      if (!exists) {
        complaintId = candidateId;
      }
    }
    if (!complaintId) {
      complaintId = `CIV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 6. Map and validate issueType and severity
    const issueType = VALID_ISSUE_TYPES.includes(analysis.issueType) ? analysis.issueType : 'Other';
    const rawSeverity = (analysis.severity?.level || analysis.severity || 'MEDIUM').toUpperCase();
    const severity = VALID_SEVERITIES.includes(rawSeverity) ? rawSeverity : 'MEDIUM';

    // 7. Structure validated AI analysis for persistence
    const aiAnalysis = {
      classification: {
        issueType: analysis.issueType || analysis.classification?.issueType || null,
        confidence: typeof (analysis.classificationConfidence ?? analysis.classification?.confidence) === 'number'
          ? (analysis.classificationConfidence ?? analysis.classification?.confidence)
          : null,
        reason: analysis.classification?.reason || ""
      },
      evidenceAnalysis: {
        summary: analysis.evidenceAnalysis?.summary || "",
        findings: Array.isArray(analysis.evidenceAnalysis?.findings) ? analysis.evidenceAnalysis.findings : []
      },
      locationAnalysis: {
        summary: analysis.locationAnalysis?.summary || ""
      },
      severityAnalysis: {
        severity: severity,
        reason: analysis.severity?.reason || ""
      },
      departmentAnalysis: {
        departmentId: department._id,
        departmentName: department.name,
        reason: analysis.department?.reason || ""
      },
      generatedComplaint: analysis.generatedComplaint || "",
      model: analysis.model || "gemini-2.5-flash",
      analyzedAt: analysis.analyzedAt ? new Date(analysis.analyzedAt) : new Date()
    };

    // 8. Prepare initial status history
    const statusHistory = [
      {
        status: 'SUBMITTED',
        changedBy: new mongoose.Types.ObjectId(citizenId),
        changedByRole: 'citizen',
        note: 'Complaint submitted',
        timestamp: new Date()
      }
    ];

    // 9. Persist Complaint and AgentAction with atomic partial-failure compensation
    let complaint;
    let agentAction;

    try {
      complaint = await Complaint.create({
        complaintId,
        citizenId: new mongoose.Types.ObjectId(citizenId),
        issueType,
        description: input.description.trim(),
        inputMethod: ['text', 'image', 'voice', 'mixed'].includes(input.inputMethod) ? input.inputMethod : 'text',
        location: {
          latitude: lat,
          longitude: lng,
          address: input.location.address || ""
        },
        evidence: Array.isArray(input.evidence) ? input.evidence : [],
        severity,
        departmentId: department._id,
        assignedTo: null,
        status: 'SUBMITTED',
        aiAnalysis,
        statusHistory,
        followUp: {
          count: 0,
          lastTriggeredAt: null,
          lastReason: null
        },
        escalation: {
          isEscalated: false,
          level: 0,
          reason: null,
          escalatedAt: null
        },
        submittedAt: new Date()
      });

      agentAction = await AgentAction.create({
        complaintId: complaint._id,
        actionType: 'COMPLAINT_SUBMITTED',
        result: 'Complaint created successfully',
        reason: 'Citizen confirmed the analyzed complaint.',
        metadata: {
          tokenHash
        },
        timestamp: new Date()
      });
    } catch (creationErr) {
      // Partial failure compensation: remove complaint if AgentAction creation failed
      if (complaint && complaint._id && !agentAction) {
        try {
          await Complaint.findByIdAndDelete(complaint._id);
        } catch (cleanupErr) {
          console.error('Failed to compensate partial complaint creation:', cleanupErr);
        }
      }
      throw creationErr;
    }

    // 10. Return standardized response
    return {
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint: {
          complaintId: complaint.complaintId,
          issueType: complaint.issueType,
          severity: complaint.severity,
          department: department.name,
          status: complaint.status,
          submittedAt: complaint.submittedAt
        },
        // Direct properties for backward compatibility
        complaintId: complaint.complaintId,
        status: complaint.status,
        department: department.name,
        issueType: complaint.issueType
      }
    };
  }
}

module.exports = new ComplaintSubmissionService();
