const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

async function testBackend() {
  const api = axios.create({ baseURL: API_URL, withCredentials: true });
  let cookie = '';

  // Intercept to save cookie
  api.interceptors.response.use(response => {
    if (response.headers['set-cookie']) {
      cookie = response.headers['set-cookie'][0];
    }
    return response;
  });

  api.interceptors.request.use(config => {
    if (cookie) config.headers.Cookie = cookie;
    return config;
  });

  try {
    console.log('1. Testing Login...');
    let res = await api.post('/auth/login', { email: 'citizen@civic.local', password: 'citizenpassword' });
    console.log('Login success:', res.data);

    console.log('\n2. Testing /auth/me...');
    res = await api.get('/auth/me');
    console.log('/auth/me success:', res.data.email);

    // Skip AI analysis (too complex for simple script since it might need file uploads)
    
    console.log('\n3. Testing Logout...');
    res = await api.post('/auth/logout');
    console.log('Logout success');

    console.log('\n4. Testing /auth/me after logout (should fail 401)...');
    try {
      await api.get('/auth/me');
      console.log('FAIL: Should have thrown 401');
    } catch (err) {
      console.log('Expected 401 Error:', err.response.status);
    }

    console.log('\n5. Testing Register...');
    const rand = Math.floor(Math.random() * 10000);
    res = await api.post('/auth/register', { 
      name: 'Test Citizen', 
      email: `testcitizen${rand}@civic.local`, 
      password: 'password123' 
    });
    console.log('Register success:', res.data.email);

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testBackend();
