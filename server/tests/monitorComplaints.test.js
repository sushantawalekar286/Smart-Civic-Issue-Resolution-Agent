const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Complaint = require('../src/models/Complaint');
const Department = require('../src/models/Department');
const User = require('../src/models/User');
const AgentAction = require('../src/models/AgentAction');
const {
  processSingleComplaint,
  checkAndProcessComplaints,
  getDefaultThresholds
} = require('../src/services/agent/monitorComplaints.service');

describe('Agentic Monitoring, Follow-up & Escalation Service', () => {
  let citizenUser;
  let authorityUser;
  let otherAuthorityUser;
  let adminUser;
  let roadDept;
  let infraDept;
  let waterDept;

  let authorityToken;
  let otherAuthorityToken;
  let adminToken;

  beforeEach(async () => {
    // 1. Create Departments
    infraDept = await Department.create({
      code: 'INFRA_TEST',
      name: 'Higher Infrastructure Authority',
      issueTypes: ['Public Infrastructure Damage']
    });

    roadDept = await Department.create({
      code: 'ROAD_TEST',
      name: 'Road Department',
      issueTypes: ['Pothole', 'Road Damage'],
      escalationDepartmentId: infraDept._id
    });

    waterDept = await Department.create({
      code: 'WATER_TEST',
      name: 'Water Supply Department',
      issueTypes: ['Water Leakage'],
      escalationDepartmentId: null // No escalation department
    });

    // 2. Create Users
    citizenUser = await User.create({
      name: 'Citizen Tester',
      email: `citizen_${Date.now()}@test.local`,
      passwordHash: 'hash',
      role: 'citizen'
    });

    authorityUser = await User.create({
      name: 'Road Authority Tester',
      email: `road_auth_${Date.now()}@test.local`,
      passwordHash: 'hash',
      role: 'authority',
      departmentId: roadDept._id
    });

    otherAuthorityUser = await User.create({
      name: 'Water Authority Tester',
      email: `water_auth_${Date.now()}@test.local`,
      passwordHash: 'hash',
      role: 'authority',
      departmentId: waterDept._id
    });

    adminUser = await User.create({
      name: 'Admin Tester',
      email: `admin_${Date.now()}@test.local`,
      passwordHash: 'hash',
      role: 'admin'
    });

    const secret = process.env.JWT_SECRET || 'secret';
    authorityToken = jwt.sign({ id: authorityUser._id }, secret, { expiresIn: '1d' });
    otherAuthorityToken = jwt.sign({ id: otherAuthorityUser._id }, secret, { expiresIn: '1d' });
    adminToken = jwt.sign({ id: adminUser._id }, secret, { expiresIn: '1d' });
  });

  const createTestComplaint = async (overrides = {}, hoursAgo = 0) => {
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return await Complaint.create({
      complaintId: `TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      citizenId: citizenUser._id,
      issueType: 'Pothole',
      description: 'Pothole on main avenue needing repair.',
      severity: 'HIGH',
      departmentId: roadDept._id,
      status: 'SUBMITTED',
      location: { latitude: 12.9716, longitude: 77.5946, address: 'Test St' },
      submittedAt: timestamp,
      createdAt: timestamp,
      ...overrides
    });
  };

  it('1. should take no action on an unresolved complaint below the threshold (e.g. 5 hours old)', async () => {
    const complaint = await createTestComplaint({}, 5);

    const result = await processSingleComplaint(complaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });

    expect(result.actionTaken).toBeNull();

    const fresh = await Complaint.findById(complaint._id);
    expect(fresh.followUp.count).toBe(0);
    expect(fresh.escalation.isEscalated).toBe(false);
    expect(fresh.status).toBe('SUBMITTED');

    const actions = await AgentAction.find({ complaintId: complaint._id });
    expect(actions.length).toBe(0);
  });

  it('2. should initiate follow-up for a complaint beyond the follow-up threshold (25 hours old)', async () => {
    const complaint = await createTestComplaint({}, 25);

    const result = await processSingleComplaint(complaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });

    expect(result.actionTaken).toBe('FOLLOW_UP_INITIATED');

    const fresh = await Complaint.findById(complaint._id);
    expect(fresh.followUp.count).toBe(1);
    expect(fresh.followUp.lastTriggeredAt).toBeDefined();
    expect(fresh.followUp.lastReason).toContain('follow-up threshold');
    expect(fresh.status).toBe('SUBMITTED'); // Status remains SUBMITTED, not escalated

    const actions = await AgentAction.find({ complaintId: complaint._id });
    expect(actions.length).toBe(1);
    expect(actions[0].actionType).toBe('FOLLOW_UP_INITIATED');
    expect(actions[0].reason).toContain('follow-up threshold');
  });

  it('3. should prevent duplicate follow-up in repeated monitoring cycles', async () => {
    const complaint = await createTestComplaint({}, 26);

    // Cycle 1
    const res1 = await processSingleComplaint(complaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });
    expect(res1.actionTaken).toBe('FOLLOW_UP_INITIATED');

    // Cycle 2
    const complaintAfterCycle1 = await Complaint.findById(complaint._id);
    const res2 = await processSingleComplaint(complaintAfterCycle1, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });
    expect(res2.actionTaken).toBeNull();

    const fresh = await Complaint.findById(complaint._id);
    expect(fresh.followUp.count).toBe(1); // Count did not increase

    const actions = await AgentAction.find({ complaintId: complaint._id });
    expect(actions.length).toBe(1); // No duplicate AgentAction
  });

  it('4. should escalate complaint beyond escalation threshold (50 hours old) and update status to ESCALATED', async () => {
    const complaint = await createTestComplaint({}, 50);

    const result = await processSingleComplaint(complaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });

    expect(result.actionTaken).toBe('ESCALATION_INITIATED');

    const fresh = await Complaint.findById(complaint._id);
    expect(fresh.status).toBe('ESCALATED');
    expect(fresh.escalation.isEscalated).toBe(true);
    expect(fresh.escalation.level).toBe(1);
    expect(fresh.escalation.reason).toBeDefined();
    expect(fresh.escalation.escalatedAt).toBeDefined();

    // Re-routed to escalation department (infraDept)
    expect(fresh.departmentId.toString()).toBe(infraDept._id.toString());

    // Verified statusHistory
    const lastHistory = fresh.statusHistory[fresh.statusHistory.length - 1];
    expect(lastHistory.status).toBe('ESCALATED');
    expect(lastHistory.changedByRole).toBe('agent');
    expect(lastHistory.note).toContain('Autonomous agent escalation');

    // Verified AgentAction
    const actions = await AgentAction.find({ complaintId: complaint._id });
    expect(actions.length).toBe(1);
    expect(actions[0].actionType).toBe('ESCALATION_INITIATED');
    expect(actions[0].metadata.escalatedToDepartmentId.toString()).toBe(infraDept._id.toString());
  });

  it('5. should prevent duplicate escalation in repeated monitoring cycles', async () => {
    const complaint = await createTestComplaint({}, 52);

    // Cycle 1
    const res1 = await processSingleComplaint(complaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });
    expect(res1.actionTaken).toBe('ESCALATION_INITIATED');

    // Cycle 2
    const updatedComplaint = await Complaint.findById(complaint._id);
    const res2 = await processSingleComplaint(updatedComplaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });
    expect(res2.actionTaken).toBeNull();

    const fresh = await Complaint.findById(complaint._id);
    expect(fresh.escalation.level).toBe(1); // Level remains 1

    const actions = await AgentAction.find({ complaintId: complaint._id });
    expect(actions.length).toBe(1); // Still only 1 escalation record
  });

  it('6. should never follow up or escalate an already RESOLVED complaint', async () => {
    const complaint = await createTestComplaint({
      status: 'RESOLVED'
    }, 72); // 72 hours old but resolved

    const result = await processSingleComplaint(complaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });

    expect(result.actionTaken).toBeNull();

    const fresh = await Complaint.findById(complaint._id);
    expect(fresh.status).toBe('RESOLVED');
    expect(fresh.escalation.isEscalated).toBe(false);
    expect(fresh.followUp.count).toBe(0);

    const actions = await AgentAction.find({ complaintId: complaint._id });
    expect(actions.length).toBe(0);
  });

  it('7. should handle escalation safely when department has no escalationDepartmentId (null)', async () => {
    const complaint = await createTestComplaint({
      departmentId: waterDept._id
    }, 55);

    const result = await processSingleComplaint(complaint, {
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });

    expect(result.actionTaken).toBe('ESCALATION_INITIATED');

    const fresh = await Complaint.findById(complaint._id);
    expect(fresh.status).toBe('ESCALATED');
    expect(fresh.escalation.isEscalated).toBe(true);
    // Retains original department safely without crashing
    expect(fresh.departmentId.toString()).toBe(waterDept._id.toString());

    const actions = await AgentAction.find({ complaintId: complaint._id });
    expect(actions.length).toBe(1);
    expect(actions[0].metadata.escalatedToDepartmentId).toBeNull();
  });

  it('8. should process batch complaints via checkAndProcessComplaints', async () => {
    // 1 recent (5h) -> no action
    await createTestComplaint({}, 5);
    // 1 follow-up eligible (26h) -> FOLLOW_UP_INITIATED
    await createTestComplaint({}, 26);
    // 1 escalation eligible (50h) -> ESCALATION_INITIATED
    await createTestComplaint({}, 50);
    // 1 resolved (60h) -> no action
    await createTestComplaint({ status: 'RESOLVED' }, 60);

    const scanResult = await checkAndProcessComplaints({
      followUpThresholdHours: 24,
      escalationThresholdHours: 48
    });

    // 3 unresolved complaints scanned
    expect(scanResult.scannedCount).toBe(3);
    // 2 actions executed (1 follow-up + 1 escalation)
    expect(scanResult.actionsCount).toBe(2);

    const actionTypes = scanResult.details.map(d => d.actionTaken).sort();
    expect(actionTypes).toEqual(['ESCALATION_INITIATED', 'FOLLOW_UP_INITIATED']);
  });

  describe('Admin / Authority Visibility API: GET /api/v1/complaints/:complaintId/agent-actions', () => {
    let complaint;

    beforeEach(async () => {
      complaint = await createTestComplaint({}, 25);
      await processSingleComplaint(complaint, { followUpThresholdHours: 24, escalationThresholdHours: 48 });
    });

    it('should allow authority from the same department to view agent actions', async () => {
      const res = await request(app)
        .get(`/api/v1/complaints/${complaint.complaintId}/agent-actions`)
        .set('Cookie', [`jwt=${authorityToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].actionType).toBe('FOLLOW_UP_INITIATED');
    });

    it('should reject authority from a different department (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/complaints/${complaint.complaintId}/agent-actions`)
        .set('Cookie', [`jwt=${otherAuthorityToken}`]);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('Not authorized');
    });

    it('should allow admin to view agent actions for any complaint', async () => {
      const res = await request(app)
        .get(`/api/v1/complaints/${complaint.complaintId}/agent-actions`)
        .set('Cookie', [`jwt=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].actionType).toBe('FOLLOW_UP_INITIATED');
    });

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .get(`/api/v1/complaints/${complaint.complaintId}/agent-actions`);

      expect(res.statusCode).toBe(401);
    });
  });
});
