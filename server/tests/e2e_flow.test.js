const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Complaint = require('../src/models/Complaint');
const AgentAction = require('../src/models/AgentAction');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

jest.setTimeout(90000);

describe('Full End-to-End Citizen, Admin & Cloudinary Flows', () => {
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('password123', 10);
  });

  it('Citizen Flow: Intake with real Cloudinary image -> Submission -> Persistence -> Refresh Retrieval', async () => {
    // 1. Create Department and Citizen
    const roadDept = await Department.create({
      code: 'ROAD',
      name: 'Road Infrastructure Dept',
      issueTypes: ['Pothole', 'Road Damage']
    });

    const citizen = await User.create({
      name: 'E2E Citizen User',
      email: `citizen_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'citizen'
    });

    // 2. Citizen Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: citizen.email, password: 'password123' });

    expect(loginRes.statusCode).toBe(200);
    const citizenCookie = loginRes.headers['set-cookie'];
    expect(citizenCookie).toBeDefined();

    // 3. Citizen Intake with real PNG image -> Cloudinary Upload
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(pngBase64, 'base64');

    const intakeRes = await request(app)
      .post('/api/v1/complaints/analyze')
      .set('Cookie', citizenCookie)
      .field('description', 'Severe deep pothole causing traffic obstruction on University Road.')
      .field('location', JSON.stringify({
        latitude: 18.5204,
        longitude: 73.8567,
        address: 'University Road, Pune'
      }))
      .attach('image', imageBuffer, 'evidence_pothole.png');

    expect(intakeRes.statusCode).toBe(200);
    expect(intakeRes.body.success).toBe(true);
    expect(intakeRes.body.data.analysisToken).toBeDefined();
    expect(intakeRes.body.data.evidence.length).toBe(1);

    const uploadedCloudinaryUrl = intakeRes.body.data.evidence[0].url;
    expect(uploadedCloudinaryUrl).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    const analysisToken = intakeRes.body.data.analysisToken;

    // 4. Final Complaint Submission
    const submitRes = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', citizenCookie)
      .send({ analysisToken });

    expect(submitRes.statusCode).toBe(201);
    expect(submitRes.body.success).toBe(true);
    const submittedComplaintId = submitRes.body.data.complaint.complaintId;
    expect(submittedComplaintId).toBeDefined();

    // 5. Verify Duplicate Submission is rejected (409 Conflict)
    const dupRes = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', citizenCookie)
      .send({ analysisToken });

    expect(dupRes.statusCode).toBe(409);
    expect(dupRes.body.error).toMatch(/already been submitted/);

    // 6. Verify MongoDB persistence with real Cloudinary HTTPS URL
    const complaintInDb = await Complaint.findOne({ complaintId: submittedComplaintId });
    expect(complaintInDb).toBeDefined();
    expect(complaintInDb.citizenId.toString()).toBe(citizen._id.toString());
    expect(complaintInDb.evidence.length).toBe(1);
    expect(complaintInDb.evidence[0].url).toBe(uploadedCloudinaryUrl);
    expect(complaintInDb.evidence[0].url).toMatch(/^https:\/\/res\.cloudinary\.com\//);

    // 7. Verify AgentAction audit record created
    const actionInDb = await AgentAction.findOne({ complaintId: complaintInDb._id });
    expect(actionInDb).toBeDefined();
    expect(actionInDb.actionType).toBe('COMPLAINT_SUBMITTED');

    // 8. Citizen fetches My Complaints (Refresh persistence)
    const myComplaintsRes = await request(app)
      .get('/api/v1/complaints')
      .set('Cookie', citizenCookie);

    expect(myComplaintsRes.statusCode).toBe(200);
    expect(myComplaintsRes.body.success).toBe(true);
    expect(myComplaintsRes.body.data.length).toBe(1);
    expect(myComplaintsRes.body.data[0].complaintId).toBe(submittedComplaintId);
    expect(myComplaintsRes.body.data[0].evidence[0].url).toBe(uploadedCloudinaryUrl);

    // 9. Citizen fetches Complaint Details by ID
    const detailsRes = await request(app)
      .get(`/api/v1/complaints/${submittedComplaintId}`)
      .set('Cookie', citizenCookie);

    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.success).toBe(true);
    expect(detailsRes.body.data.complaintId).toBe(submittedComplaintId);
    expect(detailsRes.body.data.evidence[0].url).toBe(uploadedCloudinaryUrl);
    expect(detailsRes.body.data.statusHistory.length).toBe(1);
    expect(detailsRes.body.data.aiAnalysis).toBeDefined();

    // 10. Another Citizen cannot view this complaint (403 Forbidden)
    const otherCitizen = await User.create({
      name: 'Other Citizen',
      email: `other_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'citizen'
    });

    const otherLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: otherCitizen.email, password: 'password123' });

    const otherCookie = otherLogin.headers['set-cookie'];

    const forbiddenRes = await request(app)
      .get(`/api/v1/complaints/${submittedComplaintId}`)
      .set('Cookie', otherCookie);

    expect(forbiddenRes.statusCode).toBe(403);
    expect(forbiddenRes.body.error).toMatch(/Not authorized/);

    // 11. Other Citizen sees empty list
    const otherListRes = await request(app)
      .get('/api/v1/complaints')
      .set('Cookie', otherCookie);

    expect(otherListRes.statusCode).toBe(200);
    expect(otherListRes.body.data).toEqual([]);
  });

  it('Admin Flow: Login -> Fetch Multi-Department Complaints -> View Details -> Filter & Pagination', async () => {
    // 1. Create two departments
    const roadDept = await Department.create({
      code: `ROADA_${Date.now()}`,
      name: 'Roads Dept A',
      issueTypes: ['Pothole']
    });

    const sanitationDept = await Department.create({
      code: `SANA_${Date.now()}`,
      name: 'Sanitation Dept A',
      issueTypes: ['Garbage']
    });

    // 2. Create Admin and Citizen
    const admin = await User.create({
      name: 'Admin Boss',
      email: `admin_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'admin'
    });

    const citizen = await User.create({
      name: 'Test Citizen C',
      email: `citizen_c_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'citizen'
    });

    // 3. Create Complaints in different departments
    const c1 = await Complaint.create({
      complaintId: `CIV-${Date.now()}-ROADS01`,
      citizenId: citizen._id,
      issueType: 'Pothole',
      description: 'Pothole on 5th Avenue',
      inputMethod: 'text',
      location: { latitude: 18.5204, longitude: 73.8567, address: '5th Ave' },
      evidence: [],
      severity: 'HIGH',
      departmentId: roadDept._id,
      status: 'SUBMITTED',
      submittedAt: new Date()
    });

    const c2 = await Complaint.create({
      complaintId: `CIV-${Date.now()}-SAN01`,
      citizenId: citizen._id,
      issueType: 'Garbage',
      description: 'Trash pile on Market Street',
      inputMethod: 'text',
      location: { latitude: 18.5204, longitude: 73.8567, address: 'Market St' },
      evidence: [],
      severity: 'LOW',
      departmentId: sanitationDept._id,
      status: 'SUBMITTED',
      submittedAt: new Date()
    });

    // 4. Admin Login
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: admin.email, password: 'password123' });

    expect(adminLogin.statusCode).toBe(200);
    const adminCookie = adminLogin.headers['set-cookie'];

    // 5. Admin lists complaints across departments
    const adminListRes = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Cookie', adminCookie);

    expect(adminListRes.statusCode).toBe(200);
    expect(adminListRes.body.success).toBe(true);

    const complaints = adminListRes.body.complaints || adminListRes.body.data;
    expect(Array.isArray(complaints)).toBe(true);
    expect(complaints.length).toBe(2);

    // Verify both departments are visible
    const depts = complaints.map(c => c.departmentId?.name);
    expect(depts).toContain('Roads Dept A');
    expect(depts).toContain('Sanitation Dept A');

    // 6. Admin views specific complaint details
    const adminDetailRes = await request(app)
      .get(`/api/v1/admin/complaints/${c1.complaintId}`)
      .set('Cookie', adminCookie);

    expect(adminDetailRes.statusCode).toBe(200);
    const detail = adminDetailRes.body.data || adminDetailRes.body.complaint;
    expect(detail.complaintId).toBe(c1.complaintId);
    expect(detail.issueType).toBe('Pothole');

    // 7. Admin filters by status and severity
    const filterRes = await request(app)
      .get('/api/v1/admin/complaints')
      .query({ severity: 'HIGH' })
      .set('Cookie', adminCookie);

    expect(filterRes.statusCode).toBe(200);
    const filtered = filterRes.body.complaints || filterRes.body.data;
    expect(filtered.length).toBe(1);
    expect(filtered[0].complaintId).toBe(c1.complaintId);
  });

  it('Role Authorization Boundaries: Citizen and Authority cannot access admin complaints', async () => {
    const dept = await Department.create({
      code: `AUTH_DEPT_${Date.now()}`,
      name: 'Auth Dept',
      issueTypes: ['Pothole']
    });

    const citizen = await User.create({
      name: 'Citizen RBAC',
      email: `citizen_rbac_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'citizen'
    });

    const authority = await User.create({
      name: 'Authority RBAC',
      email: `authority_rbac_${Date.now()}_intake@test.local`,
      passwordHash,
      role: 'authority',
      departmentId: dept._id
    });

    const citizenLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: citizen.email, password: 'password123' });

    const authorityLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: authority.email, password: 'password123' });

    // Citizen forbidden from admin complaints
    const citizenAdminRes = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Cookie', citizenLogin.headers['set-cookie']);
    expect(citizenAdminRes.statusCode).toBe(403);

    // Authority forbidden from admin complaints
    const authAdminRes = await request(app)
      .get('/api/v1/admin/complaints')
      .set('Cookie', authorityLogin.headers['set-cookie']);
    expect(authAdminRes.statusCode).toBe(403);
  });
});
