const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Complaint = require('../src/models/Complaint');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Complaint Intake API', () => {
  let citizenToken;
  let adminToken;
  let citizen;

  beforeAll(async () => {
    const hash = await bcrypt.hash('password123', 10);
    
    citizen = await User.create({
      name: 'Test Citizen',
      email: 'citizen_intake@test.local',
      passwordHash: hash,
      role: 'citizen'
    });

    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin_intake@test.local',
      passwordHash: hash,
      role: 'admin'
    });

    citizenToken = jwt.sign({ id: citizen._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/analyze')
      .send({});
      
    expect(res.statusCode).toEqual(401);
  });

  it('should reject non-citizen (admin) request', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/analyze')
      .set('Cookie', [`jwt=${adminToken}`])
      .send({});
      
    expect(res.statusCode).toEqual(403);
  });

  it('should reject empty description', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/analyze')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({
        description: '',
        location: { latitude: 0, longitude: 0 }
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/Please describe/);
  });

  it('should reject invalid location', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/analyze')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({
        description: 'Valid description',
        location: { latitude: 200, longitude: 0 }
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/Latitude must be between/);
  });

  it('should reject unsupported file formats safely', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/analyze')
      .set('Cookie', [`jwt=${citizenToken}`])
      .field('description', 'Valid description for invalid file test')
      .field('location', JSON.stringify({ latitude: 18.5204, longitude: 73.8567 }))
      .attach('image', Buffer.from('hello world plain text'), 'test.txt');

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toMatch(/Unsupported image format/);
  });

  it('should return standardized payload on success', async () => {
    const res = await request(app)
      .post('/api/v1/complaints/analyze')
      .set('Cookie', [`jwt=${citizenToken}`])
      .send({
        description: 'Valid description here',
        location: { latitude: 40.7128, longitude: -74.0060 }
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.description).toEqual('Valid description here');
    expect(res.body.data.location.latitude).toEqual(40.7128);
    expect(res.body.data.evidence).toEqual([]);
    expect(res.body.data.inputMethod).toEqual('text');
  });
});

describe('Citizen Complaint Retrieval & Isolation API', () => {
  let citizenAToken;
  let citizenBToken;
  let citizenA;
  let citizenB;
  let department;
  let complaintA;

  beforeEach(async () => {
    const hash = await bcrypt.hash('password123', 10);

    department = await Department.create({
      code: `ROADS_${Date.now()}`,
      name: 'Roads & Bridges Department',
      issueTypes: ['Pothole']
    });

    citizenA = await User.create({
      name: 'Citizen Alpha',
      email: `citizen_a_${Date.now()}_intake@test.local`,
      passwordHash: hash,
      role: 'citizen'
    });

    citizenB = await User.create({
      name: 'Citizen Beta',
      email: `citizen_b_${Date.now()}_intake@test.local`,
      passwordHash: hash,
      role: 'citizen'
    });

    citizenAToken = jwt.sign({ id: citizenA._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    citizenBToken = jwt.sign({ id: citizenB._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    complaintA = await Complaint.create({
      complaintId: `CIV-${Date.now()}-TEST01`,
      citizenId: citizenA._id,
      issueType: 'Pothole',
      description: 'Dangerous pothole on Main Street.',
      inputMethod: 'text',
      location: { latitude: 18.5204, longitude: 73.8567, address: 'Main St' },
      evidence: [
        {
          type: 'image',
          url: 'https://res.cloudinary.com/gqxenajw/image/upload/v1234567/sample.jpg',
          fileName: 'pothole.jpg',
          mimeType: 'image/jpeg'
        }
      ],
      severity: 'HIGH',
      departmentId: department._id,
      status: 'SUBMITTED',
      submittedAt: new Date()
    });
  });

  it('citizen A should be able to fetch their own complaints list', async () => {
    const res = await request(app)
      .get('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenAToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].complaintId).toBe(complaintA.complaintId);
    expect(res.body.data[0].department).toBe(department.name);
  });

  it('citizen B should see an empty list and not see citizen A complaints', async () => {
    const res = await request(app)
      .get('/api/v1/complaints')
      .set('Cookie', [`jwt=${citizenBToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('citizen A can fetch their specific complaint details by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/complaints/${complaintA._id}`)
      .set('Cookie', [`jwt=${citizenAToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.complaintId).toBe(complaintA.complaintId);
    expect(res.body.data.evidence.length).toBe(1);
    expect(res.body.data.evidence[0].url).toContain('cloudinary.com');
  });

  it('citizen B is forbidden from accessing citizen A complaint details (403)', async () => {
    const res = await request(app)
      .get(`/api/v1/complaints/${complaintA._id}`)
      .set('Cookie', [`jwt=${citizenBToken}`]);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/Not authorized/);
  });

  it('unauthenticated request to complaints is rejected with 401', async () => {
    const res = await request(app)
      .get('/api/v1/complaints');

    expect(res.statusCode).toBe(401);
  });
});
