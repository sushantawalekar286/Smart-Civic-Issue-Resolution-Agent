const storageService = require('../services/storage.service');

exports.analyzeIntake = async (req, res, next) => {
  try {
    const { description, location } = req.body;
    let parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    
    let evidence = [];
    let inputMethod = 'text';

    if (req.file) {
      // Validate file type natively as well
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        res.status(400);
        throw new Error('Unsupported image format.');
      }

      // Mock upload using the storage service
      const uploadResult = await storageService.uploadImage(req.file.path);
      
      evidence.push({
        type: 'image',
        url: uploadResult.url,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype
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
    const agentOrchestrator = require('../services/ai/agentOrchestrator.service');
    const aiAnalysis = await agentOrchestrator.analyzeComplaint(payload);

    let analysisToken = null;
    if (req.user && req.user._id) {
      const analysisTokenService = require('../services/analysisToken.service');
      analysisToken = analysisTokenService.generateToken(req.user._id.toString(), payload, aiAnalysis);
    }

    // Note: Do NOT save to database yet. Step 5 will handle citizen review & final submission.
    res.status(200).json({
      success: true,
      data: {
        ...payload,
        aiAnalysis,
        analysisToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const complaintSubmissionService = require('../services/complaintSubmission.service');

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
