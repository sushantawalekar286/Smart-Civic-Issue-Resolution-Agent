const { body, query, validationResult } = require('express-validator');

// Helper to handle express-validator result
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  next();
};

exports.validateAuthorityCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('departmentId')
    .notEmpty().withMessage('Department ID is required')
    .isMongoId().withMessage('Invalid department ID format'),
  body('phone')
    .optional()
    .trim(),
  handleValidationErrors
];

exports.validateAuthorityUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .trim(),
  body('departmentId')
    .optional()
    .isMongoId().withMessage('Invalid department ID format'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  body('role')
    .custom(val => {
      if (val && val !== 'authority') {
        throw new Error('Role modification is not allowed');
      }
      return true;
    }),
  handleValidationErrors
];

exports.validateDepartmentCreation = [
  body('code')
    .trim()
    .notEmpty().withMessage('Department code is required')
    .isLength({ min: 2, max: 20 }).withMessage('Code must be between 2 and 20 characters'),
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required'),
  body('issueTypes')
    .isArray({ min: 1 }).withMessage('At least one issue type is required'),
  body('contactEmail')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Invalid contact email format'),
  body('escalationDepartmentId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid escalation department ID format'),
  handleValidationErrors
];

exports.validateDepartmentUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty'),
  body('issueTypes')
    .optional()
    .isArray().withMessage('issueTypes must be an array'),
  body('contactEmail')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Invalid contact email format'),
  body('escalationDepartmentId')
    .optional({ nullable: true }),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  handleValidationErrors
];
