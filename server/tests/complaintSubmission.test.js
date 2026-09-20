const complaintSubmissionService = require('../src/services/complaintSubmission.service');
const analysisTokenService = require('../src/services/analysisToken.service');

describe('Complaint Submission Service', () => {
  const citizenId = '605c72ef2f8fb814b56fa182';
  const input = { description: 'Pothole on Main St', location: { lat: 10, lng: 20 } };
  const analysis = { issueType: 'Pothole', department: { code: 'ROAD', name: 'Roads Dept' }, severity: { level: 'HIGH' } };

  beforeAll(() => {
    process.env.ANALYSIS_TOKEN_SECRET = 'test_secret';
    analysisTokenService.secret = 'test_secret';
  });

  it('should successfully submit complaint with a valid token', async () => {
    const token = analysisTokenService.generateToken(citizenId, input, analysis);
    
    const result = await complaintSubmissionService.submitComplaint(token, citizenId);
    
    expect(result.success).toBe(true);
    expect(result.data.complaintId).toBeDefined();
    expect(result.data.status).toBe('SUBMITTED');
    expect(result.data.department).toBe('Roads Dept');
  });

  it('should reject if token is missing', async () => {
    await expect(complaintSubmissionService.submitComplaint(null, citizenId))
      .rejects.toThrow('Analysis token is required for submission');
  });

  it('should reject if token is verified for a different citizen', async () => {
    const token = analysisTokenService.generateToken(citizenId, input, analysis);
    
    await expect(complaintSubmissionService.submitComplaint(token, 'another_citizen'))
      .rejects.toThrow('Token does not belong to the current user');
  });

  it('should reject if token is invalid or tampered', async () => {
    await expect(complaintSubmissionService.submitComplaint('invalid_token', citizenId))
      .rejects.toThrow('Invalid analysis token signature');
  });
});
