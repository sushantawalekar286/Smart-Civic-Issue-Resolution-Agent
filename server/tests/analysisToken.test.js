const analysisTokenService = require('../src/services/analysisToken.service');
const jwt = require('jsonwebtoken');

describe('Analysis Token Service', () => {
  const citizenId = '605c72ef2f8fb814b56fa182';
  const input = { description: 'Pothole on Main St', location: { lat: 10, lng: 20 } };
  const analysis = { issueType: 'Pothole', department: { code: 'ROAD' }, severity: { level: 'HIGH' } };

  beforeAll(() => {
    // Override secret for tests if needed
    process.env.ANALYSIS_TOKEN_SECRET = 'test_secret';
    analysisTokenService.secret = 'test_secret';
  });

  it('should generate a valid token', () => {
    const token = analysisTokenService.generateToken(citizenId, input, analysis);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, 'test_secret');
    expect(decoded.sub).toBe(citizenId);
    expect(decoded.type).toBe('civic-complaint-analysis');
    expect(decoded.input.description).toBe(input.description);
  });

  it('should verify a valid token successfully', () => {
    const token = analysisTokenService.generateToken(citizenId, input, analysis);
    const decoded = analysisTokenService.verifyToken(token, citizenId);
    
    expect(decoded.sub).toBe(citizenId);
    expect(decoded.type).toBe('civic-complaint-analysis');
  });

  it('should reject when token is missing', () => {
    expect(() => analysisTokenService.verifyToken(null, citizenId)).toThrow('Token is missing');
  });

  it('should reject invalid signature', () => {
    const token = jwt.sign({ sub: citizenId, type: 'civic-complaint-analysis', input, analysis }, 'wrong_secret');
    expect(() => analysisTokenService.verifyToken(token, citizenId)).toThrow('Invalid analysis token signature');
  });

  it('should reject expired tokens', () => {
    const token = jwt.sign(
      { sub: citizenId, type: 'civic-complaint-analysis', input, analysis },
      'test_secret',
      { expiresIn: '-1s' } // Expired 1 second ago
    );
    expect(() => analysisTokenService.verifyToken(token, citizenId)).toThrow('Analysis token expired. Please analyze again.');
  });

  it('should reject wrong token type', () => {
    const token = jwt.sign({ sub: citizenId, type: 'wrong-type', input, analysis }, 'test_secret');
    expect(() => analysisTokenService.verifyToken(token, citizenId)).toThrow('Invalid token type');
  });

  it('should reject token belonging to another citizen', () => {
    const token = analysisTokenService.generateToken(citizenId, input, analysis);
    expect(() => analysisTokenService.verifyToken(token, 'another_citizen_id')).toThrow('Token does not belong to the current user');
  });

  it('should reject malformed payload (missing analysis or input)', () => {
    const token1 = jwt.sign({ sub: citizenId, type: 'civic-complaint-analysis', input }, 'test_secret');
    expect(() => analysisTokenService.verifyToken(token1, citizenId)).toThrow('Malformed token payload');

    const token2 = jwt.sign({ sub: citizenId, type: 'civic-complaint-analysis', analysis }, 'test_secret');
    expect(() => analysisTokenService.verifyToken(token2, citizenId)).toThrow('Malformed token payload');
  });
});
