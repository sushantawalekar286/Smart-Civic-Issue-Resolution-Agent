const { ALLOWED_ISSUE_TYPES } = require('./classifyIssue.service');
const { SEVERITY_LEVELS } = require('./assessSeverity.service');
const { PROTOTYPE_DEPARTMENTS } = require('./mapDepartment.service');

const VALID_DEPT_CODES = Object.keys(PROTOTYPE_DEPARTMENTS);

/**
 * Validates AI Orchestrator output against the strict contract
 * @param {Object} aiResult - The AI analysis result to validate
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateAiOutput(aiResult) {
  const errors = [];

  if (!aiResult || typeof aiResult !== 'object' || Array.isArray(aiResult)) {
    return {
      isValid: false,
      errors: ['AI output must be a non-null object.']
    };
  }

  // 1. Validate issueType
  if (!aiResult.issueType || typeof aiResult.issueType !== 'string') {
    errors.push('Missing or invalid "issueType". Must be a non-empty string.');
  } else if (!ALLOWED_ISSUE_TYPES.includes(aiResult.issueType)) {
    errors.push(`Invalid "issueType": "${aiResult.issueType}". Must be one of: ${ALLOWED_ISSUE_TYPES.join(', ')}.`);
  }

  // 2. Validate classificationConfidence
  if (typeof aiResult.classificationConfidence !== 'number' || isNaN(aiResult.classificationConfidence)) {
    errors.push('Missing or invalid "classificationConfidence". Must be a number.');
  } else if (aiResult.classificationConfidence < 0 || aiResult.classificationConfidence > 1) {
    errors.push(`"classificationConfidence" must be between 0 and 1. Got: ${aiResult.classificationConfidence}.`);
  }

  // 3. Validate evidenceAnalysis
  if (!aiResult.evidenceAnalysis || typeof aiResult.evidenceAnalysis !== 'object' || Array.isArray(aiResult.evidenceAnalysis)) {
    errors.push('Missing or invalid "evidenceAnalysis". Must be an object.');
  } else {
    if (typeof aiResult.evidenceAnalysis.summary !== 'string' || aiResult.evidenceAnalysis.summary.trim().length === 0) {
      errors.push('"evidenceAnalysis.summary" must be a non-empty string.');
    }
    if (!Array.isArray(aiResult.evidenceAnalysis.findings)) {
      errors.push('"evidenceAnalysis.findings" must be an array of strings.');
    } else if (aiResult.evidenceAnalysis.findings.some(item => typeof item !== 'string')) {
      errors.push('All items in "evidenceAnalysis.findings" must be strings.');
    }
  }

  // 4. Validate locationAnalysis
  if (!aiResult.locationAnalysis || typeof aiResult.locationAnalysis !== 'object' || Array.isArray(aiResult.locationAnalysis)) {
    errors.push('Missing or invalid "locationAnalysis". Must be an object.');
  } else {
    if (typeof aiResult.locationAnalysis.summary !== 'string' || aiResult.locationAnalysis.summary.trim().length === 0) {
      errors.push('"locationAnalysis.summary" must be a non-empty string.');
    }
  }

  // 5. Validate severity
  if (!aiResult.severity || typeof aiResult.severity !== 'object' || Array.isArray(aiResult.severity)) {
    errors.push('Missing or invalid "severity". Must be an object.');
  } else {
    if (!aiResult.severity.level || !SEVERITY_LEVELS.includes(aiResult.severity.level)) {
      errors.push(`Invalid "severity.level": "${aiResult.severity.level}". Must be one of: ${SEVERITY_LEVELS.join(', ')}.`);
    }
    if (typeof aiResult.severity.reason !== 'string' || aiResult.severity.reason.trim().length === 0) {
      errors.push('"severity.reason" must be a non-empty string.');
    }
  }

  // 6. Validate department
  if (!aiResult.department || typeof aiResult.department !== 'object' || Array.isArray(aiResult.department)) {
    errors.push('Missing or invalid "department". Must be an object.');
  } else {
    if (!aiResult.department.code || !VALID_DEPT_CODES.includes(aiResult.department.code)) {
      errors.push(`Invalid "department.code": "${aiResult.department.code}". Must resolve to an authorized department code.`);
    }
    if (typeof aiResult.department.name !== 'string' || aiResult.department.name.trim().length === 0) {
      errors.push('"department.name" must be a non-empty string.');
    }
    if (typeof aiResult.department.reason !== 'string' || aiResult.department.reason.trim().length === 0) {
      errors.push('"department.reason" must be a non-empty string.');
    }
  }

  // 7. Validate generatedComplaint
  if (typeof aiResult.generatedComplaint !== 'string' || aiResult.generatedComplaint.trim().length === 0) {
    errors.push('Missing or empty "generatedComplaint". Must be a non-empty string.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateAiOutput
};
