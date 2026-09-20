const fs = require('fs');
const path = require('path');
const http = require('http');

async function testE2E() {
  console.log('--- Step 1: Login as Citizen ---');
  const loginPayload = JSON.stringify({ email: 'citizen@civic.local', password: 'citizenpassword' });
  const loginRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.write(loginPayload);
    req.end();
  });

  console.log('Login status:', loginRes.status);
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
  console.log('Session Cookie received:', Boolean(cookie));

  console.log('\n--- Step 2: Prepare Real Image & Multipart Payload ---');
  const boundary = '----CivicFormBoundary' + Date.now();
  const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNk+M/wHwMDAwMQwAgAAC5wA/7h3g2tAAAAAElFTkSuQmCC', 'base64');
  
  const crlf = '\r\n';
  const bodyParts = [];

  // Description field
  bodyParts.push(Buffer.from(
    '--' + boundary + crlf +
    'Content-Disposition: form-data; name="description"' + crlf + crlf +
    'Massive deep pothole on MG Road near Metro Station causing severe road hazard and vehicle damage' + crlf
  ));

  // Location field
  bodyParts.push(Buffer.from(
    '--' + boundary + crlf +
    'Content-Disposition: form-data; name="location"' + crlf + crlf +
    JSON.stringify({ latitude: 12.9716, longitude: 77.5946, address: 'MG Road Metro Station' }) + crlf
  ));

  // Image field
  bodyParts.push(Buffer.from(
    '--' + boundary + crlf +
    'Content-Disposition: form-data; name="image"; filename="pothole_evidence.png"' + crlf +
    'Content-Type: image/png' + crlf + crlf
  ));
  bodyParts.push(imageBuffer);
  bodyParts.push(Buffer.from(crlf + '--' + boundary + '--' + crlf));

  const multipartBody = Buffer.concat(bodyParts);

  console.log('\n--- Step 3: Send POST /api/v1/complaints/analyze ---');
  const analyzeRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/complaints/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': multipartBody.length,
        'Cookie': cookie
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.write(multipartBody);
    req.end();
  });

  console.log('Analyze HTTP Status:', analyzeRes.status);
  const analyzeData = JSON.parse(analyzeRes.data);
  console.log('Analyze Success:', analyzeData.success);
  console.log('Input Method:', analyzeData.data?.inputMethod);
  console.log('Evidence Count:', analyzeData.data?.evidence?.length);
  const evidenceItem = analyzeData.data?.evidence?.[0];
  console.log('Evidence URL:', evidenceItem?.url);
  console.log('Is Real Cloudinary URL:', evidenceItem?.url?.includes('res.cloudinary.com/gqxenajw'));
  console.log('AI Analysis IssueType:', analyzeData.data?.aiAnalysis?.issueType);
  console.log('AI Analysis Department:', analyzeData.data?.aiAnalysis?.department?.name);
  console.log('AI Analysis Severity:', analyzeData.data?.aiAnalysis?.severity?.level);
  const token = analyzeData.data?.analysisToken;
  console.log('Analysis Token Generated:', Boolean(token));

  if (!token) {
    console.error('No analysis token returned, cannot proceed to submission');
    return;
  }

  console.log('\n--- Step 4: Submit Final Complaint (POST /api/v1/complaints) ---');
  const submitPayload = JSON.stringify({ analysisToken: token });
  const submitRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/complaints',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(submitPayload),
        'Cookie': cookie
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.write(submitPayload);
    req.end();
  });

  console.log('Submit HTTP Status:', submitRes.status);
  const submitData = JSON.parse(submitRes.data);
  console.log('Submit Success:', submitData.success);
  const complaint = submitData.data?.complaint;
  console.log('Created Complaint ID:', complaint?.complaintId);
  console.log('Created Status:', complaint?.status);
  console.log('Created Evidence in DB:', JSON.stringify(complaint?.evidence, null, 2));
  console.log('Real Cloudinary verified in DB:', complaint?.evidence?.[0]?.url?.includes('res.cloudinary.com/gqxenajw'));
}

testE2E().catch(console.error);
