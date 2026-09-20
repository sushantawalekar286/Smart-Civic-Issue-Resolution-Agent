const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Complaint = require('../src/models/Complaint');

describe('Authority Workflow and Status Management API', () => {
  let roadDept;
  let sanitationDept;
  let citizenUser;
  let roadAuthority;
  let sanitationAuthority;
  let citizenToken;
  let roadAuthorityToken;
  let sanitationAuthorityToken;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Departments
    roadDept = await Department.create({
      code: 'ROAD',
      name: 'Road / Public Works Department',
      issueTypes: ['Pothole', 'Road Damage']
    });

    sanitationDept = await Department.create({
      code: 'SANITATION',
      name: 'Sanitation Department',
      issueTypes: ['Garbage']
    });

    // Create Users (use _intake@test.local convention if needed, or unique emails)
    citizenUser = await User.create({
      name: 'Test Citizen',
      email: `citizen_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'citizen'
    });

    roadAuthority = await User.create({
      name: 'Road Officer',
      email: `road_officer_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'authority',
      departmentId: roadDept._id
    });

    sanitationAuthority = await User.create({
      name: 'Sanitation Officer',
      email: `sanitation_officer_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'authority',
      departmentId: sanitationDept._id
    });

    const secret = process.env.JWT_SECRET || 'secret';
    citizenToken = jwt.sign({ id: citizenUser._id }, secret, { expiresIn: '1d' });
    roadAuthorityToken = jwt.sign({ id: roadAuthority._id }, secret, { expiresIn: '1d' });
    sanitationAuthorityToken = jwt.sign({ id: sanitationAuthority._id }, secret, { expiresIn: '1d' });
  });

  const createComplaintFixture = async (deptId, status = 'SUBMITTED', overrides = {}) => {
    return await Complaint.create({
      complaintId: `CMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: citizenUser._id,
      issueType: 'Pothole',
      description: 'Dangerous pothole on main road causing traffic delays.',
      inputMethod: 'text',
      location: {
        latitude: 18.5204,
        longitude: 73.8567,
        address: 'FC Road, Pune'
      },
      evidence: [],
      severity: 'HIGH',
      departmentId: deptId,
      status,
      statusHistory: [
        {
          status,
          changedBy: citizenUser._id,
          changedByRole: 'citizen',
          note: 'Initial complaint submission',
          timestamp: new Date()
        }
      ],
      aiAnalysis: {
        classification: { issueType: 'Pothole', confidence: 0.95 },
        severityAnalysis: { severity: 'HIGH', reason: 'High traffic risk' },
        departmentAnalysis: { departmentId: deptId, departmentName: 'Road / Public Works Department' },
        generatedComplaint: 'Pothole on FC Road.'
      },
      ...overrides
    });
  };

  // 1. Unauthenticated authority endpoint rejected (401)
  it('1. should reject unauthenticated access to authority endpoints with 401', async () => {
    const res = await request(app)
      .get('/api/v1/authority/complaints');

    expect(res.statusCode).toBe(401);
  });

  // 2. Citizen cannot access authority endpoint (403)
  it('2. should reject citizen access to authority endpoints with 403', async () => {
    const res = await request(app)
      .get('/api/v1/authority/complaints')
      .set('Cookie', [`jwt=${citizenToken}`]);

    expect(res.statusCode).toBe(403);
  });

  // 3. Authority can list own department complaints
  it('3. should allow authority to list own department complaints', async () => {
    await createComplaintFixture(roadDept._id);
    await createComplaintFixture(roadDept._id);

    const res = await request(app)
      .get('/api/v1/authority/complaints')
      .set('Cookie', [`jwt=${roadAuthorityToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.data.length).toBe(2);
    expect(res.body.stats.total).toBe(2);
    expect(res.body.stats.submitted).toBe(2);
  });

  // 4. Authority cannot see another department's complaints
  it('4. should not include complaints belonging to other departments in list', async () => {
    await createComplaintFixture(roadDept._id);
    await createComplaintFixture(sanitationDept._id);

    const res = await request(app)
      .get('/api/v1/authority/complaints')
      .set('Cookie', [`jwt=${roadAuthorityToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].departmentId._id.toString()).toBe(roadDept._id.toString());
  });

  // 5. Authority can open own department complaint
  it('5. should allow authority to get details of own department complaint', async () => {
    const complaint = await createComplaintFixture(roadDept._id);

    const res = await request(app)
      .get(`/api/v1/authority/complaints/${complaint.complaintId}`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toBe(complaint.complaintId);
    expect(res.body.data.aiAnalysis).toBeDefined();
    expect(res.body.data.aiAnalysis.classification.issueType).toBe('Pothole');
  });

  // 6. Authority cannot open another department complaint
  it('6. should reject authority viewing another department complaint with 403', async () => {
    const sanitationComplaint = await createComplaintFixture(sanitationDept._id);

    const res = await request(app)
      .get(`/api/v1/authority/complaints/${sanitationComplaint.complaintId}`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`]);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/another department/i);
  });

  // 7. SUBMITTED → ASSIGNED works
  it('7. should transition SUBMITTED to ASSIGNED successfully', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'SUBMITTED');

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'ASSIGNED',
        note: 'Assigned to Road inspection team.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  // 8. ASSIGNED → IN_PROGRESS works
  it('8. should transition ASSIGNED to IN_PROGRESS successfully', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'ASSIGNED', {
      assignedTo: roadAuthority._id
    });

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'IN_PROGRESS',
        note: 'Crew has reached the site and began asphalt patching.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  // 9. IN_PROGRESS → RESOLVED works
  it('9. should transition IN_PROGRESS to RESOLVED with required note', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'IN_PROGRESS', {
      assignedTo: roadAuthority._id
    });

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'RESOLVED',
        note: 'Pothole asphalt repair fully completed and road reopened.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  // 10. ASSIGNED → ESCALATED works
  it('10. should allow manual transition from ASSIGNED to ESCALATED', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'ASSIGNED', {
      assignedTo: roadAuthority._id
    });

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'ESCALATED',
        note: 'Requires major budget approval from municipal commissioner.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ESCALATED');
    expect(res.body.data.escalation.isEscalated).toBe(true);
  });

  // 11. IN_PROGRESS → ESCALATED works
  it('11. should allow manual transition from IN_PROGRESS to ESCALATED', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'IN_PROGRESS', {
      assignedTo: roadAuthority._id
    });

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'ESCALATED',
        note: 'Underground gas line conflict encountered during excavation.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ESCALATED');
    expect(res.body.data.escalation.isEscalated).toBe(true);
  });

  // 12. Invalid transitions rejected
  it('12. should reject invalid status transitions (e.g. RESOLVED to SUBMITTED)', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'RESOLVED', {
      assignedTo: roadAuthority._id
    });

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'SUBMITTED',
        note: 'Trying to reopen'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid status transition/i);
  });

  // 13. statusHistory is updated
  it('13. should append statusHistory entry with role, changedBy, and note', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'SUBMITTED');

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'ASSIGNED',
        note: 'Assigned to Ward Engineer'
      });

    expect(res.statusCode).toBe(200);
    const history = res.body.data.statusHistory;
    expect(history.length).toBe(2);
    const latest = history[history.length - 1];
    expect(latest.status).toBe('ASSIGNED');
    expect(latest.changedByRole).toBe('authority');
    expect(latest.note).toBe('Assigned to Ward Engineer');
    expect(latest.timestamp).toBeDefined();
  });

  // 14. assignedTo is set when SUBMITTED → ASSIGNED
  it('14. should automatically set assignedTo to the authority user on SUBMITTED → ASSIGNED', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'SUBMITTED');
    expect(complaint.assignedTo).toBeNull();

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'ASSIGNED',
        note: 'Taking ownership'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.assignedTo._id.toString()).toBe(roadAuthority._id.toString());
  });

  // 15. Missing/invalid status rejected
  it('15. should reject missing status or invalid status string with 400', async () => {
    const complaint = await createComplaintFixture(roadDept._id, 'SUBMITTED');

    // Missing status
    const res1 = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({});

    expect(res1.statusCode).toBe(400);

    // Invalid status
    const res2 = await request(app)
      .patch(`/api/v1/authority/complaints/${complaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({ status: 'NON_EXISTENT_STATUS' });

    expect(res2.statusCode).toBe(400);

    // RESOLVED without note
    const inProg = await createComplaintFixture(roadDept._id, 'IN_PROGRESS');
    const res3 = await request(app)
      .patch(`/api/v1/authority/complaints/${inProg.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({ status: 'RESOLVED', note: '' });

    expect(res3.statusCode).toBe(400);
    expect(res3.body.error).toMatch(/Resolution note is required/i);
  });

  // 16. Unauthorized department access rejected for PATCH
  it('16. should reject authority trying to modify status of another department complaint with 403', async () => {
    const sanitationComplaint = await createComplaintFixture(sanitationDept._id, 'SUBMITTED');

    const res = await request(app)
      .patch(`/api/v1/authority/complaints/${sanitationComplaint.complaintId}/status`)
      .set('Cookie', [`jwt=${roadAuthorityToken}`])
      .send({
        status: 'ASSIGNED',
        note: 'Unauthorized cross-department attempt'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/another department/i);
  });
});
