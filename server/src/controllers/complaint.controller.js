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

    // Note: Do not save to database. Only prepare the payload for Step 4.
    res.status(200).json({
      success: true,
      data: payload
    });
  } catch (error) {
    next(error);
  }
};
