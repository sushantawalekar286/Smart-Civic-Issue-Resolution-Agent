const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Complaint Intake API', () => {
  let citizenToken;
  let adminToken;
  let citizen;

  beforeAll(async () => {
    const bcrypt = require('bcryptjs');
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

    const jwt = require('jsonwebtoken');
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
