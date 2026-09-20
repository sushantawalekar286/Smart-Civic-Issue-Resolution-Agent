const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth API', () => {
  it('should register a citizen', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Citizen Test',
        email: 'citizen@test.local',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.role).toEqual('citizen');
    
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/jwt=/);
  });

  it('should not register with duplicate email', async () => {
    await User.create({
      name: 'Existing',
      email: 'dup@test.local',
      passwordHash: 'hash',
      role: 'citizen'
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another',
        email: 'dup@test.local',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(400);
  });

  it('should login successfully', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Login Test',
      email: 'login@test.local',
      passwordHash: hash,
      role: 'citizen'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@test.local',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toEqual('login@test.local');
    
    const cookies = res.headers['set-cookie'];
    expect(cookies[0]).toMatch(/jwt=/);
  });

  it('should reject login with wrong password', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Login Fail',
      email: 'fail@test.local',
      passwordHash: hash,
      role: 'citizen'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'fail@test.local',
        password: 'wrongpassword'
      });
      
    expect(res.statusCode).toEqual(401);
  });

  it('should login with uppercase/mixed-case email', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Case Test',
      email: 'case_sensitive@test.local',
      passwordHash: hash,
      role: 'citizen'
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'Case_Sensitive@Test.Local ',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toEqual('case_sensitive@test.local');
  });

  it('should reject login for deactivated user', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Deactivated User',
      email: 'deactivated@test.local',
      passwordHash: hash,
      role: 'citizen',
      isActive: false
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'deactivated@test.local',
        password: 'password123'
      });
      
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toMatch(/deactivated/i);
  });

  it('should fetch profile with /auth/me when authenticated', async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Me Profile User',
      email: 'me@test.local',
      passwordHash: hash,
      role: 'citizen'
    });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`jwt=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id.toString()).toEqual(user._id.toString());
    expect(res.body.email).toEqual('me@test.local');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('should logout and clear auth cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/jwt=;/);
  });
});
