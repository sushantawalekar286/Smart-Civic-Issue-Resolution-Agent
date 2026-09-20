const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Complaint = require('../src/models/Complaint');
const Department = require('../src/models/Department');
const User = require('../src/models/User');
const AgentAction = require('../src/models/AgentAction');

describe('Admin Backend & Operations API', () => {
  let adminUser;
  let authorityUser;
  let citizenUser;
  let roadDept;
  let waterDept;

  let adminToken;
  let authorityToken;
  let citizenToken;

  beforeEach(async () => {
    // 1. Create Departments
    roadDept = await Department.create({
      code: 'ROAD_ADM',
      name: 'Road Department Admin Test',
      issueTypes: ['Pothole', 'Road Damage']
    });

    waterDept = await Department.create({
      code: 'WATER_ADM',
      name: 'Water Supply Admin Test',
      issueTypes: ['Water Leakage'],
      isActive: true
    });

    // 2. Create Users
    adminUser = await User.create({
      name: 'Super Admin',
      email: `admin_${Date.now()}@test.local`,
      passwordHash: 'hashed_password_admin',
      role: 'admin'
    });

    authorityUser = await User.create({
      name: 'Authority User',
      email: `authority_${Date.now()}@test.local`,
      passwordHash: 'hashed_password_auth',
      role: 'authority',
      departmentId: roadDept._id
    });

    citizenUser = await User.create({
      name: 'Citizen User',
      email: `citizen_${Date.now()}@test.local`,
      passwordHash: 'hashed_password_citizen',
      role: 'citizen'
    });

    const secret = process.env.JWT_SECRET || 'secret';
    adminToken = jwt.sign({ id: adminUser._id }, secret, { expiresIn: '1d' });
    authorityToken = jwt.sign({ id: authorityUser._id }, secret, { expiresIn: '1d' });
    citizenToken = jwt.sign({ id: citizenUser._id }, secret, { expiresIn: '1d' });
  });

  const createComplaint = async (overrides = {}) => {
    return await Complaint.create({
      complaintId: `CIV-ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: citizenUser._id,
      issueType: 'Pothole',
      description: 'Major road fissure and deep pothole needing urgent repair.',
      severity: 'HIGH',
      departmentId: roadDept._id,
      status: 'SUBMITTED',
      location: { latitude: 12.9716, longitude: 77.5946, address: 'Residency Rd' },
      submittedAt: new Date(),
      ...overrides
    });
  };

  describe('1-3. Admin Complaints List & RBAC', () => {
    it('1. admin can list complaints with pagination metadata', async () => {
      await createComplaint({ status: 'SUBMITTED' });
      await createComplaint({ status: 'ASSIGNED' });

      const res = await request(app)
        .get('/api/v1/admin/complaints')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.complaints.length).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
      expect(res.body.pagination.page).toBe(1);
    });

    it('2. citizen cannot list admin complaints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/complaints')
        .set('Cookie', [`jwt=${citizenToken}`]);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatch(/not authorized/i);
    });

    it('3. authority cannot list admin complaints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/complaints')
        .set('Cookie', [`jwt=${authorityToken}`]);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatch(/not authorized/i);
    });
  });

  describe('4. Admin Complaint Details', () => {
    it('admin can view complete complaint details including citizen and department', async () => {
      const complaint = await createComplaint();

      const res = await request(app)
        .get(`/api/v1/admin/complaints/${complaint.complaintId}`)
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaintId).toBe(complaint.complaintId);
      expect(res.body.data.citizenId.email).toBe(citizenUser.email);
      expect(res.body.data.departmentId.code).toBe(roadDept.code);
    });

    it('returns 404 for non-existent complaintId', async () => {
      const res = await request(app)
        .get('/api/v1/admin/complaints/CIV-NONEXISTENT')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe('5-6. Agent Actions Traceability', () => {
    it('5. admin can view agent actions and filter by actionType', async () => {
      const complaint = await createComplaint();
      await AgentAction.create({
        complaintId: complaint._id,
        actionType: 'FOLLOW_UP_INITIATED',
        result: 'Follow-up queued',
        reason: 'SLA threshold reached'
      });
      await AgentAction.create({
        complaintId: complaint._id,
        actionType: 'STATUS_CHECKED',
        result: 'Checked',
        reason: 'Periodic check'
      });

      const res = await request(app)
        .get('/api/v1/admin/agent-actions?actionType=FOLLOW_UP_INITIATED')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.actions.length).toBe(1);
      expect(res.body.actions[0].actionType).toBe('FOLLOW_UP_INITIATED');
    });

    it('admin can view complaint-specific agent action timeline', async () => {
      const complaint = await createComplaint();
      await AgentAction.create({
        complaintId: complaint._id,
        actionType: 'STATUS_CHECKED',
        timestamp: new Date(Date.now() - 10000)
      });
      await AgentAction.create({
        complaintId: complaint._id,
        actionType: 'FOLLOW_UP_INITIATED',
        timestamp: new Date()
      });

      const res = await request(app)
        .get(`/api/v1/admin/complaints/${complaint.complaintId}/agent-actions`)
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.actions.length).toBe(2);
      // Chronological order: first action is STATUS_CHECKED
      expect(res.body.actions[0].actionType).toBe('STATUS_CHECKED');
      expect(res.body.actions[1].actionType).toBe('FOLLOW_UP_INITIATED');
    });

    it('6. authority and citizen cannot access admin agent actions (403 Forbidden)', async () => {
      const authRes = await request(app)
        .get('/api/v1/admin/agent-actions')
        .set('Cookie', [`jwt=${authorityToken}`]);
      expect(authRes.statusCode).toBe(403);

      const citRes = await request(app)
        .get('/api/v1/admin/agent-actions')
        .set('Cookie', [`jwt=${citizenToken}`]);
      expect(citRes.statusCode).toBe(403);
    });
  });

  describe('7-8. Admin User Management & Password Security', () => {
    it('7. admin can list users with role and status filtering', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?role=authority')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users.length).toBeGreaterThanOrEqual(1);
      res.body.users.forEach(u => expect(u.role).toBe('authority'));
    });

    it('8. passwordHash is never returned in user listings or details', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      res.body.users.forEach(user => {
        expect(user.passwordHash).toBeUndefined();
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe('9-11. Authority User Creation & Updates', () => {
    it('9. admin can create authority user for an active department', async () => {
      const newAuthEmail = `new_auth_${Date.now()}@civic.local`;
      const res = await request(app)
        .post('/api/v1/admin/authorities')
        .set('Cookie', [`jwt=${adminToken}`])
        .send({
          name: 'New Water Authority',
          email: newAuthEmail,
          password: 'authpassword123',
          departmentId: waterDept._id.toString()
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('authority');
      expect(res.body.data.email).toBe(newAuthEmail.toLowerCase());
      expect(res.body.data.passwordHash).toBeUndefined();

      // Verify user in database
      const dbUser = await User.findOne({ email: newAuthEmail.toLowerCase() }).select('+passwordHash');
      expect(dbUser).toBeDefined();
      expect(dbUser.role).toBe('authority');
      expect(dbUser.passwordHash).toBeDefined();
    });

    it('admin can update authority user fields', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/authorities/${authorityUser._id}`)
        .set('Cookie', [`jwt=${adminToken}`])
        .send({
          name: 'Updated Road Lead',
          phone: '9876543210'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated Road Lead');
      expect(res.body.data.phone).toBe('9876543210');
    });

    it('10. non-admin cannot create authority user (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/authorities')
        .set('Cookie', [`jwt=${citizenToken}`])
        .send({
          name: 'Hacker Authority',
          email: 'hacker@civic.local',
          password: 'password123',
          departmentId: roadDept._id.toString()
        });

      expect(res.statusCode).toBe(403);
    });

    it('11. invalid or non-existent department is rejected with 400', async () => {
      const fakeDeptId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/v1/admin/authorities')
        .set('Cookie', [`jwt=${adminToken}`])
        .send({
          name: 'Invalid Dept Authority',
          email: `invalid_${Date.now()}@civic.local`,
          password: 'password123',
          departmentId: fakeDeptId.toString()
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/invalid or inactive department/i);
    });
  });

  describe('12-13. Department Management', () => {
    it('12. admin can list departments', async () => {
      const res = await request(app)
        .get('/api/v1/admin/departments')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('admin can create and update a department', async () => {
      const code = `DEPT_${Date.now()}`;
      const createRes = await request(app)
        .post('/api/v1/admin/departments')
        .set('Cookie', [`jwt=${adminToken}`])
        .send({
          code,
          name: 'Parks and Gardens',
          description: 'Maintenance of public parks',
          issueTypes: ['Other']
        });

      expect(createRes.statusCode).toBe(201);
      expect(createRes.body.data.code).toBe(code);

      const updateRes = await request(app)
        .patch(`/api/v1/admin/departments/${createRes.body.data._id}`)
        .set('Cookie', [`jwt=${adminToken}`])
        .send({
          description: 'Updated description'
        });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.description).toBe('Updated description');
    });

    it('13. duplicate department code is rejected with 400', async () => {
      const res = await request(app)
        .post('/api/v1/admin/departments')
        .set('Cookie', [`jwt=${adminToken}`])
        .send({
          code: roadDept.code, // already exists
          name: 'Duplicate Road',
          issueTypes: ['Pothole']
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });
  });

  describe('14-16. Dashboard Aggregation, Pagination & Filters', () => {
    it('14. dashboard statistics reflect real database aggregations', async () => {
      await createComplaint({ status: 'SUBMITTED', severity: 'HIGH' });
      await createComplaint({ status: 'ASSIGNED', severity: 'CRITICAL' });
      await createComplaint({ status: 'RESOLVED', severity: 'LOW' });
      await createComplaint({ status: 'ESCALATED', severity: 'CRITICAL' });

      await AgentAction.create({
        complaintId: new mongoose.Types.ObjectId(),
        actionType: 'FOLLOW_UP_INITIATED',
        result: 'Follow up',
        reason: 'Threshold'
      });
      await AgentAction.create({
        complaintId: new mongoose.Types.ObjectId(),
        actionType: 'ESCALATION_INITIATED',
        result: 'Escalation',
        reason: 'Threshold'
      });

      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const stats = res.body.data;
      expect(stats.complaints.total).toBe(4);
      expect(stats.complaints.submitted).toBe(1);
      expect(stats.complaints.assigned).toBe(1);
      expect(stats.complaints.resolved).toBe(1);
      expect(stats.complaints.escalated).toBe(1);
      expect(stats.complaints.unresolved).toBe(3); // submitted + assigned + inProgress + escalated

      expect(stats.complaints.severity.HIGH).toBe(1);
      expect(stats.complaints.severity.CRITICAL).toBe(2);

      expect(stats.agentActions.total).toBe(2);
      expect(stats.agentActions.followUpsInitiated).toBe(1);
      expect(stats.agentActions.escalationsInitiated).toBe(1);

      expect(stats.users.total).toBeGreaterThanOrEqual(3);
    });

    it('15. pagination limits and offsets work correctly', async () => {
      for (let i = 0; i < 5; i++) {
        await createComplaint({ description: `Pagination item ${i}` });
      }

      const page1Res = await request(app)
        .get('/api/v1/admin/complaints?page=1&limit=2')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(page1Res.statusCode).toBe(200);
      expect(page1Res.body.complaints.length).toBe(2);
      expect(page1Res.body.pagination.pages).toBe(3);
      expect(page1Res.body.pagination.total).toBe(5);

      const page2Res = await request(app)
        .get('/api/v1/admin/complaints?page=2&limit=2')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(page2Res.statusCode).toBe(200);
      expect(page2Res.body.complaints.length).toBe(2);
      // Ensure different page content
      expect(page2Res.body.complaints[0]._id).not.toBe(page1Res.body.complaints[0]._id);
    });

    it('16. complaint filters work for status, severity, and issueType', async () => {
      await createComplaint({ status: 'SUBMITTED', severity: 'LOW', issueType: 'Pothole' });
      await createComplaint({ status: 'RESOLVED', severity: 'CRITICAL', issueType: 'Road Damage' });

      const filteredRes = await request(app)
        .get('/api/v1/admin/complaints?status=SUBMITTED&severity=LOW')
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(filteredRes.statusCode).toBe(200);
      expect(filteredRes.body.complaints.length).toBe(1);
      expect(filteredRes.body.complaints[0].status).toBe('SUBMITTED');
      expect(filteredRes.body.complaints[0].severity).toBe('LOW');
    });
  });
});
