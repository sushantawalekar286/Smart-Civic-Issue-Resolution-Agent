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

    // Note: Do NOT save to database yet. Step 5 will handle citizen review & final submission.
    res.status(200).json({
      success: true,
      data: {
        ...payload,
        aiAnalysis
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
