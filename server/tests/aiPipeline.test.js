const agentOrchestrator = require('../src/services/ai/agentOrchestrator.service');
const { classifyIssue, classifyFallback } = require('../src/services/ai/classifyIssue.service');
const { analyzeEvidence } = require('../src/services/ai/analyzeEvidence.service');
const { analyzeLocation } = require('../src/services/ai/analyzeLocation.service');
const { assessSeverity } = require('../src/services/ai/assessSeverity.service');
const { mapDepartment } = require('../src/services/ai/mapDepartment.service');
const { generateComplaint } = require('../src/services/ai/generateComplaint.service');
const { validateAiOutput } = require('../src/services/ai/validateAiOutput');

describe('AI Complaint Analysis Pipeline (Step 4)', () => {
  // Test 1: Pothole description
  it('1. should accurately classify a pothole description and route to ROAD department', async () => {
    const input = {
      description: 'There is a deep pothole on Main Street causing vehicular damage.',
      location: { latitude: 16.7050, longitude: 74.2433, address: 'Main Street' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.issueType).toBe('Pothole');
    expect(result.department.code).toBe('ROAD');
    expect(result.classificationConfidence).toBeGreaterThanOrEqual(0);
    expect(result.classificationConfidence).toBeLessThanOrEqual(1);
    expect(result.severity.level).toBeDefined();
    expect(result.generatedComplaint).toContain('Issue:');
  });

  // Test 2: Garbage description
  it('2. should classify garbage accumulation and route to SANITATION department', async () => {
    const input = {
      description: 'Massive pile of uncollected garbage and rotting trash rotting on the sidewalk.',
      location: { latitude: 16.7000, longitude: 74.2400, address: 'Market Road' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.issueType).toBe('Garbage');
    expect(result.department.code).toBe('SANITATION');
    expect(result.classificationConfidence).toBeGreaterThanOrEqual(0);
    expect(result.classificationConfidence).toBeLessThanOrEqual(1);
  });

  // Test 3: Streetlight description
  it('3. should classify damaged streetlight and route to ELECTRICAL department', async () => {
    const input = {
      description: 'The streetlight pole is broken and the light bulb has been dark for three nights.',
      location: { latitude: 16.7100, longitude: 74.2500, address: 'Station Road' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.issueType).toBe('Damaged Streetlight');
    expect(result.department.code).toBe('ELECTRICAL');
  });

  // Test 4: Water leakage description
  it('4. should classify water leakage and route to WATER department', async () => {
    const input = {
      description: 'Main water supply pipe burst and drinking water is gushing into the road.',
      location: { latitude: 16.7200, longitude: 74.2600, address: 'Shivaji Chowk' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.issueType).toBe('Water Leakage');
    expect(result.department.code).toBe('WATER');
  });

  // Test 5: Drainage description
  it('5. should classify blocked drainage and route to DRAINAGE department', async () => {
    const input = {
      description: 'Underground sewer and open drainage gutter is overflowing with black wastewater.',
      location: { latitude: 16.7300, longitude: 74.2700, address: 'Gandhi Nagar' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.issueType).toBe('Drainage');
    expect(result.department.code).toBe('DRAINAGE');
  });

  // Test 6: Ambiguous issue
  it('6. should classify an ambiguous civic issue as Other with bounded confidence', async () => {
    const input = {
      description: 'Something unusual and strange was noticed near the community hall.',
      location: { latitude: 16.7400, longitude: 74.2800, address: 'Community Hall' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.issueType).toBe('Other');
    expect(result.classificationConfidence).toBeGreaterThanOrEqual(0);
    expect(result.classificationConfidence).toBeLessThanOrEqual(1);
    expect(result.department.code).toBe('INFRASTRUCTURE');
  });

  // Test 7: No image provided (ensuring non-fabrication)
  it('7. should not fabricate image evidence when no image is provided', async () => {
    const input = {
      description: 'Pothole on the asphalt.',
      location: { latitude: 16.7500, longitude: 74.2900, address: 'Ring Road' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.evidenceAnalysis.summary).toMatch(/No photographic evidence|solely on citizen text/i);
    expect(result.evidenceAnalysis.findings.some(f => /shows a photo|photo displays/i.test(f))).toBe(false);
  });

  // Test 8: Image available
  it('8. should acknowledge attached photographic evidence', async () => {
    const input = {
      description: 'Broken streetlight with hanging wire.',
      location: { latitude: 16.7600, longitude: 74.3000, address: 'College Road' },
      evidence: [
        {
          type: 'image',
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          fileName: 'pole_damage.jpg',
          mimeType: 'image/jpeg'
        }
      ]
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    expect(result.evidenceAnalysis.summary).toMatch(/pole_damage\.jpg|photographic evidence/i);
    expect(result.evidenceAnalysis.findings.length).toBeGreaterThan(0);
  });

  // Test 9: Invalid AI JSON handling
  it('9. should reject malformed or non-object AI result in validator', () => {
    const nullValidation = validateAiOutput(null);
    expect(nullValidation.isValid).toBe(false);
    expect(nullValidation.errors.length).toBeGreaterThan(0);

    const stringValidation = validateAiOutput('invalid string');
    expect(stringValidation.isValid).toBe(false);
  });

  // Test 10: Invalid issueType
  it('10. should reject invalid issueType in validator', () => {
    const invalidResult = {
      issueType: 'AlienInvasion',
      classificationConfidence: 0.9,
      evidenceAnalysis: { summary: 'Text', findings: ['f1'] },
      locationAnalysis: { summary: 'Loc' },
      severity: { level: 'HIGH', reason: 'Urgent' },
      department: { code: 'ROAD', name: 'Roads', reason: 'Road issue' },
      generatedComplaint: 'Issue: Alien'
    };

    const validation = validateAiOutput(invalidResult);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('Invalid "issueType"'))).toBe(true);
  });

  // Test 11: Invalid severity
  it('11. should reject invalid severity level in validator', () => {
    const invalidResult = {
      issueType: 'Pothole',
      classificationConfidence: 0.9,
      evidenceAnalysis: { summary: 'Text', findings: ['f1'] },
      locationAnalysis: { summary: 'Loc' },
      severity: { level: 'SUPER_URGENT', reason: 'Urgent' },
      department: { code: 'ROAD', name: 'Roads', reason: 'Road issue' },
      generatedComplaint: 'Issue: Pothole'
    };

    const validation = validateAiOutput(invalidResult);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('Invalid "severity.level"'))).toBe(true);
  });

  // Test 12: Unknown department
  it('12. should reject unknown department code in validator', () => {
    const invalidResult = {
      issueType: 'Pothole',
      classificationConfidence: 0.9,
      evidenceAnalysis: { summary: 'Text', findings: ['f1'] },
      locationAnalysis: { summary: 'Loc' },
      severity: { level: 'HIGH', reason: 'Urgent' },
      department: { code: 'SPACE_AGENCY', name: 'Space Agency', reason: 'Road issue' },
      generatedComplaint: 'Issue: Pothole'
    };

    const validation = validateAiOutput(invalidResult);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('Invalid "department.code"'))).toBe(true);
  });

  // Test 13: Missing location / empty address
  it('13. should handle missing address and coordinates without inventing an address', () => {
    const noLocationResult = analyzeLocation({});
    expect(noLocationResult.summary).toContain('not provided');

    const emptyAddressResult = analyzeLocation({ latitude: 16.7, longitude: 74.2, address: '' });
    expect(emptyAddressResult.summary).toContain('GPS coordinates provided');
    expect(emptyAddressResult.summary).toContain('No street address was provided');
    expect(emptyAddressResult.summary).not.toContain('invented');
  });

  // Test 14: Strict output contract conformance
  it('14. should conform exactly to the required 7-key output contract without arbitrary fields', async () => {
    const input = {
      description: 'Huge pothole in front of school.',
      location: { latitude: 16.7, longitude: 74.2, address: 'School Road' },
      evidence: []
    };

    const result = await agentOrchestrator.analyzeComplaint(input);
    const contractKeys = [
      'issueType',
      'classificationConfidence',
      'evidenceAnalysis',
      'locationAnalysis',
      'severity',
      'department',
      'generatedComplaint'
    ];

    expect(Object.keys(result).sort()).toEqual(contractKeys.sort());
    expect(typeof result.issueType).toBe('string');
    expect(typeof result.classificationConfidence).toBe('number');
    expect(typeof result.evidenceAnalysis.summary).toBe('string');
    expect(Array.isArray(result.evidenceAnalysis.findings)).toBe(true);
    expect(typeof result.locationAnalysis.summary).toBe('string');
    expect(typeof result.severity.level).toBe('string');
    expect(typeof result.severity.reason).toBe('string');
    expect(typeof result.department.code).toBe('string');
    expect(typeof result.department.name).toBe('string');
    expect(typeof result.department.reason).toBe('string');
    expect(typeof result.generatedComplaint).toBe('string');
  });
});
