const { body, query, validationResult } = require('express-validator');

const ALLOWED_STATUSES = [
  'SUBMITTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'ESCALATED'
];

const ALLOWED_SEVERITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

exports.validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isString().withMessage('Status must be a string')
    .isIn(ALLOWED_STATUSES).withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),

  body('note')
    .optional()
    .isString().withMessage('Note must be a string')
    .isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),

  body('note').custom((value, { req }) => {
    if (req.body.status === 'RESOLVED') {
      if (!value || typeof value !== 'string' || value.trim().length < 5) {
        throw new Error('Resolution note is required (minimum 5 characters)');
      }
    }
    return true;
  }),

  handleValidationErrors
];

exports.validateComplaintQuery = [
  query('status')
    .optional()
    .isIn(ALLOWED_STATUSES).withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),

  query('severity')
    .optional()
    .isIn(ALLOWED_SEVERITIES).withMessage(`Severity must be one of: ${ALLOWED_SEVERITIES.join(', ')}`),

  query('issueType')
    .optional()
    .isString().withMessage('issueType must be a string'),

  handleValidationErrors
];
