const axios = require('axios');
const FormData = require('form-data');

async function runTest() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'citizen@civic.local',
      password: 'citizenpassword'
    });
    const cookie = loginRes.headers['set-cookie']?.[0].split(';')[0];
    console.log('Login success, cookie:', cookie);

    const formData = new FormData();
    formData.append('description', 'Huge pothole here');
    formData.append('location', JSON.stringify({latitude:12.34, longitude:56.78, address:'123 Test'}));
    
    console.log('Sending analysis request...');
    const analyzeRes = await axios.post('http://localhost:5000/api/v1/complaints/analyze', formData, {
      headers: {
        ...formData.getHeaders(),
        Cookie: cookie
      }
    });
    
    console.log('Analysis SUCCESS:', analyzeRes.status);
    console.log(analyzeRes.data);
  } catch (error) {
    console.log('Analysis FAILED:', error.response?.status);
    console.log(error.response?.data || error.message);
  }
}
runTest();
