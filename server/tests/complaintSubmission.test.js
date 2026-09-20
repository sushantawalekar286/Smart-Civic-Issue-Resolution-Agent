const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Complaint = require('../src/models/Complaint');
const AgentAction = require('../src/models/AgentAction');
const complaintSubmissionService = require('../src/services/complaintSubmission.service');
const analysisTokenService = require('../src/services/analysisToken.service');

describe('Final Complaint Submission API & Service (Step 5B)', () => {
  let citizenUser;
  let authorityUser;
  let adminUser;
  let roadDept;
  let citizenToken;
  let authorityToken;
  let adminToken;

  const validAnalysis = {
    issueType: 'Pothole',
    classificationConfidence: 0.95,
    classification: { issueType: 'Pothole', confidence: 0.95, reason: 'Severe road hazard' },
    evidenceAnalysis: { summary: 'Photo confirms pothole', findings: ['Visual evidence confirmed'] },
    locationAnalysis: { summary: 'FC Road, Pune' },
    severity: { level: 'HIGH', reason: 'High accident risk' },
    department: { code: 'ROAD', name: 'Roads Dept' },
    generatedComplaint: 'Severe pothole reported on FC Road.',
    model: 'gemini-2.5-flash',
    analyzedAt: new Date()
  };

  const validPayload = {
    description: 'Deep dangerous pothole on FC Road near college campus.',
    inputMethod: 'text',
    location: { latitude: 18.5204, longitude: 73.8567, address: 'FC Road, Pune' },
    evidence: []
  };

  beforeAll(() => {
    process.env.ANALYSIS_TOKEN_SECRET = 'test_analysis_secret';
    analysisTokenService.secret = 'test_analysis_secret';
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Road Department
    roadDept = await Department.create({
      code: 'ROAD',
      name: 'Roads Dept',
      issueTypes: ['Pothole', 'Road Damage']
    });

    citizenUser = await User.create({
      name: 'Test Citizen',
      email: `citizen_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'citizen'
    });

    authorityUser = await User.create({
      name: 'Test Authority',
      email: `authority_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'authority',
      departmentId: roadDept._id
    });

    adminUser = await User.create({
      name: 'Test Admin',
      email: `admin_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'admin'
    });

    const jwtSecret = process.env.JWT_SECRET || 'secret';
    citizenToken = jwt.sign({ id: citizenUser._id }, jwtSecret, { expiresIn: '1d' });
    authorityToken = jwt.sign({ id: authorityUser._id }, jwtSecret, { expiresIn: '1d' });
    adminToken = jwt.sign({ id: adminUser._id }, jwtSecret, { expiresIn: '1d' });
  });

  // 1. Unauthenticated submission rejected
  it('1. should reject unauthenticated submission with 401', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .send({ analysisToken: 'dummy_token' });

    expect(res.statusCode).toBe(401);
  });

  // 2. Authority submission rejected
  it('2. should reject authority role submission with 403', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${authorityToken}`])
      .send({ analysisToken: 'dummy_token' });

    expect(res.statusCode).toBe(403);
  });

  // 3. Admin submission rejected
  it('3. should reject admin role submission with 403', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${adminToken}`])
      .send({ analysisToken: 'dummy_token' });

    expect(res.statusCode).toBe(403);
  });

  // 4. Valid citizen submission succeeds
  it('4. should successfully submit complaint via HTTP endpoint for citizen', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: token });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaint).toBeDefined();
    expect(res.body.data.complaint.status).toBe('SUBMITTED');
  });

  // 5. Complaint document is created in MongoDB
  it('5. should create persistent Complaint document in database', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    const complaint = await Complaint.findOne({ complaintId: result.data.complaint.complaintId });

    expect(complaint).toBeDefined();
    expect(complaint.description).toBe(validPayload.description);
  });

  // 6. complaintId is generated
  it('6. should generate human-readable unique complaintId (CIV-YYYYMMDD-XXXX)', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    expect(result.data.complaint.complaintId).toMatch(/^CIV-\d{8}-\d{4}$/);
  });

  // 7. status = SUBMITTED
  it('7. should set initial complaint status strictly to SUBMITTED', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    const complaint = await Complaint.findOne({ complaintId: result.data.complaint.complaintId });
    expect(complaint.status).toBe('SUBMITTED');
    expect(complaint.assignedTo).toBeNull();
  });

  // 8. citizenId is correct
  it('8. should link complaint correctly to the authenticated citizenId', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    const complaint = await Complaint.findOne({ complaintId: result.data.complaint.complaintId });
    expect(complaint.citizenId.toString()).toBe(citizenUser._id.toString());
  });

  // 9. departmentId resolves correctly
  it('9. should resolve departmentId correctly from validated department code', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    const complaint = await Complaint.findOne({ complaintId: result.data.complaint.complaintId });
    expect(complaint.departmentId.toString()).toBe(roadDept._id.toString());
  });

  // 10. AI analysis is persisted
  it('10. should accurately persist AI analysis within Complaint.aiAnalysis', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    const complaint = await Complaint.findOne({ complaintId: result.data.complaint.complaintId });
    expect(complaint.aiAnalysis).toBeDefined();
    expect(complaint.aiAnalysis.classification.issueType).toBe('Pothole');
    expect(complaint.aiAnalysis.departmentAnalysis.departmentName).toBe('Roads Dept');
    expect(complaint.aiAnalysis.severityAnalysis.severity).toBe('HIGH');
  });

  // 11. Initial statusHistory is created
  it('11. should append initial statusHistory entry with role, author, note, and timestamp', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    const complaint = await Complaint.findOne({ complaintId: result.data.complaint.complaintId });
    expect(complaint.statusHistory).toHaveLength(1);
    expect(complaint.statusHistory[0].status).toBe('SUBMITTED');
    expect(complaint.statusHistory[0].changedByRole).toBe('citizen');
    expect(complaint.statusHistory[0].changedBy.toString()).toBe(citizenUser._id.toString());
    expect(complaint.statusHistory[0].note).toBe('Complaint submitted');
  });

  // 12. COMPLAINT_SUBMITTED AgentAction is created
  it('12. should create COMPLAINT_SUBMITTED AgentAction record', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    const result = await complaintSubmissionService.submitComplaint(token, citizenUser._id.toString());
    const complaint = await Complaint.findOne({ complaintId: result.data.complaint.complaintId });
    
    const action = await AgentAction.findOne({ complaintId: complaint._id, actionType: 'COMPLAINT_SUBMITTED' });
    expect(action).toBeDefined();
    expect(action.actionType).toBe('COMPLAINT_SUBMITTED');
    expect(action.result).toBe('Complaint created successfully');
  });

  // 13. Invalid token rejected
  it('13. should reject invalid analysis token with 400', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: 'completely.invalid.token' });

    expect(res.statusCode).toBe(400);
  });

  // 14. Expired token rejected
  it('14. should reject expired analysis token with 400', async () => {
    const expiredToken = jwt.sign(
      { sub: citizenUser._id.toString(), type: 'civic-complaint-analysis', input: validPayload, analysis: validAnalysis },
      analysisTokenService.secret,
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: expiredToken });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  // 15. Tampered token rejected
  it('15. should reject tampered analysis token signature with 400', async () => {
    const forgedToken = jwt.sign(
      { sub: citizenUser._id.toString(), type: 'civic-complaint-analysis', input: validPayload, analysis: validAnalysis },
      'forged_secret'
    );

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: forgedToken });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/signature/i);
  });

  // 16. Wrong token type rejected
  it('16. should reject token with wrong type claim with 400', async () => {
    const wrongTypeToken = jwt.sign(
      { sub: citizenUser._id.toString(), type: 'wrong-type', input: validPayload, analysis: validAnalysis },
      analysisTokenService.secret,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: wrongTypeToken });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid token type/i);
  });

  // 17. Token belonging to another citizen rejected
  it('17. should reject token generated for a different citizen with 403', async () => {
    const otherCitizenId = new mongoose.Types.ObjectId().toString();
    const token = analysisTokenService.generateToken(otherCitizenId, validPayload, validAnalysis);

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: token });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/not belong/i);
  });

  // 18. Unknown department rejected
  it('18. should reject submission if department code is unknown with 404', async () => {
    const unknownDeptAnalysis = {
      ...validAnalysis,
      department: { code: 'NONEXISTENT_DEPT' }
    };
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, unknownDeptAnalysis);

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: token });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/department not found/i);
  });

  // 19. Malformed token payload rejected
  it('19. should reject malformed token missing input or analysis with 400', async () => {
    const malformedToken = jwt.sign(
      { sub: citizenUser._id.toString(), type: 'civic-complaint-analysis' },
      analysisTokenService.secret,
      { expiresIn: '15m' }
    );

    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: malformedToken });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/malformed/i);
  });

  // 20. Duplicate submission prevented
  it('20. should prevent duplicate submission of the same analysis token with 409', async () => {
    const token = analysisTokenService.generateToken(citizenUser._id.toString(), validPayload, validAnalysis);

    // First submission succeeds
    const res1 = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: token });

    expect(res1.statusCode).toBe(201);

    // Second submission with exact same token must fail
    const res2 = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({ analysisToken: token });

    expect(res2.statusCode).toBe(409);
    expect(res2.body.message).toMatch(/already been submitted/i);
  });
});
