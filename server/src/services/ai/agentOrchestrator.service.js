const { classifyIssue } = require('./classifyIssue.service');
const { analyzeEvidence } = require('./analyzeEvidence.service');
const { analyzeLocation } = require('./analyzeLocation.service');
const { assessSeverity } = require('./assessSeverity.service');
const { mapDepartment } = require('./mapDepartment.service');
const { generateComplaint } = require('./generateComplaint.service');
const { validateAiOutput } = require('./validateAiOutput');

/**
 * Agent Orchestrator Service
 * Coordinates the multi-step civic complaint analysis workflow:
 * Standardized Input -> Classification -> Evidence -> Location -> Severity -> Department -> Complaint Generation -> Validation
 */
class AgentOrchestratorService {
  /**
   * Run the end-to-end AI analysis pipeline
   * @param {Object} input - Standardized complaint intake input
   * @param {string} input.description - Complaint description text
   * @param {Object} [input.location] - Location coordinates and address
   * @param {Array} [input.evidence] - Media evidence array
   * @param {string} [input.inputMethod] - Input method ('text', 'image', 'mixed', etc.)
   * @returns {Promise<Object>} Validated structured AI analysis result
   */
  async analyzeComplaint(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid intake input: Expected an object.');
    }

    const description = (input.description || '').trim();
    const location = input.location || {};
    const evidence = Array.isArray(input.evidence) ? input.evidence : [];

    console.log('AI_ANALYSIS_STARTED');

    // Stage 1: Issue Classification
    const classificationResult = await classifyIssue({
      description,
      evidence
    });
    console.log('ISSUE_CLASSIFICATION_COMPLETED');

    // Stage 2: Evidence Analysis
    const evidenceResult = await analyzeEvidence({
      description,
      evidence
    });
    console.log('EVIDENCE_ANALYSIS_COMPLETED');

    // Stage 3: Location Analysis
    const locationResult = analyzeLocation(location);
    console.log('LOCATION_ANALYSIS_COMPLETED');

    // Stage 4: Severity Assessment
    const severityResult = await assessSeverity({
      description,
      issueType: classificationResult.issueType,
      evidence
    });
    console.log('SEVERITY_ASSESSMENT_COMPLETED');

    // Stage 5: Department Mapping
    const departmentResult = await mapDepartment({
      issueType: classificationResult.issueType,
      description
    });
    console.log('DEPARTMENT_MAPPING_COMPLETED');

    // Stage 6: Structured Complaint Generation
    const generatedComplaintText = await generateComplaint({
      issueType: classificationResult.issueType,
      severity: severityResult.severity,
      location,
      description,
      department: departmentResult
    });
    console.log('COMPLAINT_GENERATION_COMPLETED');

    // Final AI Output Contract Assembly
    const aiOutput = {
      issueType: classificationResult.issueType,
      classificationConfidence: classificationResult.confidence,
      evidenceAnalysis: {
        summary: evidenceResult.summary,
        findings: evidenceResult.findings
      },
      locationAnalysis: {
        summary: locationResult.summary
      },
      severity: {
        level: severityResult.severity,
        reason: severityResult.reason
      },
      department: {
        code: departmentResult.code,
        name: departmentResult.name,
        reason: departmentResult.reason
      },
      generatedComplaint: generatedComplaintText
    };

    // Stage 7: Strict Output Validation
    const validation = validateAiOutput(aiOutput);
    if (!validation.isValid) {
      const errorMsg = `AI analysis validation failed: ${validation.errors.join('; ')}`;
      const validationError = new Error(errorMsg);
      validationError.statusCode = 422;
      validationError.validationErrors = validation.errors;
      throw validationError;
    }

    console.log('AI_ANALYSIS_COMPLETED');
    return aiOutput;
  }
}

module.exports = new AgentOrchestratorService();
