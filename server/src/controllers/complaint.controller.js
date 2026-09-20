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
