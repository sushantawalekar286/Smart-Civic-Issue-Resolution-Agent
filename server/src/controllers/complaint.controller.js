const complaintSubmissionService = require('../services/complaintSubmission.service');

exports.submitComplaint = async (req, res, next) => {
  try {
    const { analysisToken } = req.body;
    
    if (!analysisToken) {
      return res.status(400).json({
        success: false,
        message: 'Analysis token is required'
      });
    }

    const result = await complaintSubmissionService.submitComplaint(analysisToken, req.user._id.toString());

    res.status(201).json(result);
  } catch (error) {
    // If it's a known token error, send 400
    if (error.message.includes('Analysis token expired') ||
        error.message.includes('Invalid analysis token signature') ||
        error.message.includes('Token does not belong') ||
        error.message.includes('Malformed token') ||
        error.message.includes('Invalid token type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};
