const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Complaint = require('../src/models/Complaint');
const AgentAction = require('../src/models/AgentAction');
const storageService = require('../src/services/storage.service');
const analysisTokenService = require('../src/services/analysisToken.service');

describe('Citizen Complaint Persistence & Cloudinary Integration Tests', () => {
  let citizenA;
  let citizenB;
  let authorityUser;
  let adminUser;
  let roadDept;
  let citizenAToken;
  let citizenBToken;
  let authorityToken;
  let adminToken;

  const validAnalysis = {
    issueType: 'Pothole',
    classificationConfidence: 0.92,
    classification: { issueType: 'Pothole', confidence: 0.92, reason: 'Broken road surface' },
    evidenceAnalysis: { summary: 'Image shows pothole', findings: ['Pothole detected'] },
    locationAnalysis: { summary: 'Main St, City' },
    severity: { level: 'HIGH', reason: 'Hazardous' },
    department: { code: 'ROAD', name: 'Roads Dept' },
    generatedComplaint: 'Pothole on Main St requiring urgent repair.',
    model: 'gemini-2.5-flash',
    analyzedAt: new Date()
  };

  const validPayload = {
    description: 'Pothole on Main St near building #12.',
    inputMethod: 'mixed',
    location: { latitude: 12.9716, longitude: 77.5946, address: 'Main St, City' },
    evidence: [
      {
        type: 'image',
        url: 'https://res.cloudinary.com/gqxenajw/image/upload/v12345678/smart-civic-issues/test.jpg',
        publicId: 'smart-civic-issues/test',
        fileName: 'pothole.jpg',
        mimeType: 'image/jpeg'
      }
    ]
  };

  beforeAll(() => {
    process.env.ANALYSIS_TOKEN_SECRET = 'test_analysis_secret';
    analysisTokenService.secret = 'test_analysis_secret';
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    roadDept = await Department.create({
      code: 'ROAD',
      name: 'Roads Dept',
      issueTypes: ['Pothole', 'Road Damage']
    });

    citizenA = await User.create({
      name: 'Citizen A',
      email: `citizena_${Date.now()}@test.local`,
      passwordHash,
      role: 'citizen'
    });

    citizenB = await User.create({
      name: 'Citizen B',
      email: `citizenb_${Date.now()}@test.local`,
      passwordHash,
      role: 'citizen'
    });

    authorityUser = await User.create({
      name: 'Authority User',
      email: `authority_${Date.now()}@test.local`,
      passwordHash,
      role: 'authority',
      departmentId: roadDept._id
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: `admin_${Date.now()}@test.local`,
      passwordHash,
      role: 'admin'
    });

    const jwtSecret = process.env.JWT_SECRET || 'secret';
    citizenAToken = jwt.sign({ id: citizenA._id }, jwtSecret, { expiresIn: '1d' });
    citizenBToken = jwt.sign({ id: citizenB._id }, jwtSecret, { expiresIn: '1d' });
    authorityToken = jwt.sign({ id: authorityUser._id }, jwtSecret, { expiresIn: '1d' });
    adminToken = jwt.sign({ id: adminUser._id }, jwtSecret, { expiresIn: '1d' });
  });

  it('1. should persist submitted complaint and allow citizen to retrieve own complaints list', async () => {
    const token = analysisTokenService.generateToken(citizenA._id.toString(), validPayload, validAnalysis);

    const submitRes = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenAToken}`])
      .send({ analysisToken: token });

    expect(submitRes.statusCode).toBe(201);
    expect(submitRes.body.success).toBe(true);
    const complaintId = submitRes.body.data.complaintId;
    expect(complaintId).toBeDefined();

    // Retrieve citizen complaints list
    const getRes = await request(app)
      .get('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenAToken}`]);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(Array.isArray(getRes.body.data)).toBe(true);
    expect(getRes.body.data.length).toBe(1);
    expect(getRes.body.data[0].complaintId).toBe(complaintId);
    expect(getRes.body.data[0].department).toBe('Roads Dept');
  });

  it('2. should allow citizen to retrieve own complaint details by complaintId', async () => {
    const token = analysisTokenService.generateToken(citizenA._id.toString(), validPayload, validAnalysis);

    const submitRes = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenAToken}`])
      .send({ analysisToken: token });

    const complaintId = submitRes.body.data.complaintId;

    const detailRes = await request(app)
      .get(`/api/v1/complaints/${complaintId}`)
      .set('Cookie', [`jwt=${citizenAToken}`]);

    expect(detailRes.statusCode).toBe(200);
    expect(detailRes.body.success).toBe(true);
    expect(detailRes.body.data.complaintId).toBe(complaintId);
    expect(detailRes.body.data.evidence).toHaveLength(1);
    expect(detailRes.body.data.evidence[0].url).toContain('cloudinary.com');
  });

  it('3. should DENY Citizen A from retrieving Citizen B complaint with 403 Forbidden', async () => {
    const token = analysisTokenService.generateToken(citizenB._id.toString(), validPayload, validAnalysis);

    const submitRes = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenBToken}`])
      .send({ analysisToken: token });

    const complaintId = submitRes.body.data.complaintId;

    // Citizen A tries to fetch Citizen B's complaint details
    const unauthorizedRes = await request(app)
      .get(`/api/v1/complaints/${complaintId}`)
      .set('Cookie', [`jwt=${citizenAToken}`]);

    expect(unauthorizedRes.statusCode).toBe(403);
    expect(unauthorizedRes.body.error).toMatch(/not authorized/i);
  });

  it('4. should ensure Citizen A list query returns ONLY Citizen A complaints', async () => {
    const tokenA = analysisTokenService.generateToken(citizenA._id.toString(), validPayload, validAnalysis);
    const tokenB = analysisTokenService.generateToken(citizenB._id.toString(), validPayload, validAnalysis);

    await request(app).post('/api/v1/complaints').set('Cookie', [`jwt=${citizenAToken}`]).send({ analysisToken: tokenA });
    await request(app).post('/api/v1/complaints').set('Cookie', [`jwt=${citizenBToken}`]).send({ analysisToken: tokenB });

    const getARes = await request(app).get('/api/v1/complaints').set('Cookie', [`jwt=${citizenAToken}`]);
    expect(getARes.body.data).toHaveLength(1);
    expect(getARes.body.data[0].citizenId.toString()).toBe(citizenA._id.toString());
  });

  it('5. should allow Admin to retrieve any complaint via admin endpoint', async () => {
    const token = analysisTokenService.generateToken(citizenA._id.toString(), validPayload, validAnalysis);

    const submitRes = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenAToken}`])
      .send({ analysisToken: token });

    const complaintId = submitRes.body.data.complaintId;

    const adminRes = await request(app)
      .get(`/api/v1/admin/complaints/${complaintId}`)
      .set('Cookie', [`jwt=${adminToken}`]);

    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.data.complaintId).toBe(complaintId);
  });

  it('6. should allow Department Authority to retrieve assigned department complaint', async () => {
    const token = analysisTokenService.generateToken(citizenA._id.toString(), validPayload, validAnalysis);

    const submitRes = await request(app)
      .post('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenAToken}`])
      .send({ analysisToken: token });

    const complaintId = submitRes.body.data.complaintId;

    const authRes = await request(app)
      .get(`/api/v1/authority/complaints/${complaintId}`)
      .set('Cookie', [`jwt=${authorityToken}`]);

    expect(authRes.statusCode).toBe(200);
    expect(authRes.body.data.complaintId).toBe(complaintId);
  });

  it('7. should handle missing Cloudinary credentials gracefully with clear configuration error', async () => {
    const origName = process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_CLOUD_NAME;

    const tmpFilePath = path.join(__dirname, 'test_tmp.jpg');
    fs.writeFileSync(tmpFilePath, 'fake image data');

    await expect(storageService.uploadImage(tmpFilePath)).rejects.toThrow(/Cloudinary configuration missing/i);

    // Restore env
    process.env.CLOUDINARY_CLOUD_NAME = origName;
  });
});
