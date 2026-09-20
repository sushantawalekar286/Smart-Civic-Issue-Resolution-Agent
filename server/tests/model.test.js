const mongoose = require('mongoose');
const Complaint = require('../src/models/Complaint');
const User = require('../src/models/User');
const Department = require('../src/models/Department');

describe('Model Validation', () => {
  it('should invalidate complaint with wrong issue type', async () => {
    const citizen = new User({ name: 'Test', email: 'test@civic.local', passwordHash: 'hash' });
    const department = new Department({ code: 'TEST', name: 'Test Dept' });
    
    const complaint = new Complaint({
      complaintId: 'CIV-TEST-0001',
      citizenId: citizen._id,
      issueType: 'InvalidIssue', // Invalid
      description: 'Test',
      location: { latitude: 0, longitude: 0 },
      severity: 'LOW',
      departmentId: department._id
    });
    
    let error;
    try {
      await complaint.validate();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.issueType).toBeDefined();
  });

  it('should invalidate complaint with missing location', async () => {
    const citizen = new User({ name: 'Test', email: 'test2@civic.local', passwordHash: 'hash' });
    const department = new Department({ code: 'TEST2', name: 'Test Dept2' });
    
    const complaint = new Complaint({
      complaintId: 'CIV-TEST-0002',
      citizenId: citizen._id,
      issueType: 'Pothole',
      description: 'Test',
      severity: 'LOW',
      departmentId: department._id
    });
    
    let error;
    try {
      await complaint.validate();
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors['location.latitude']).toBeDefined();
  });
});
