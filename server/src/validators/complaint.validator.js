const { body, validationResult } = require('express-validator');

exports.validateComplaintIntake = [
  body('description')
    .trim()
    .notEmpty().withMessage('Please describe the civic issue.')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters.'),
  
  body('inputMethod')
    .optional()
    .isIn(['text', 'image', 'mixed']).withMessage('Invalid input method'),

  body('location.latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

  body('location.longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

  // Validation middleware execution
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }
    next();
  }
];
