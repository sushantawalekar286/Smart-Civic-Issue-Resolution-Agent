const Complaint = require('../../models/Complaint');
const Department = require('../../models/Department');
const AgentAction = require('../../models/AgentAction');

/**
 * Default prototype threshold configurations (hours).
 * Overridable via environment variables or function arguments.
 */
const getDefaultThresholds = () => ({
  followUpThresholdHours: parseFloat(process.env.FOLLOW_UP_THRESHOLD_HOURS) || 24,
  escalationThresholdHours: parseFloat(process.env.ESCALATION_THRESHOLD_HOURS) || 48
});

/**
 * Process a single complaint for follow-up or escalation.
 * Idempotent: will not trigger duplicate follow-ups or repeated escalations.
 *
 * @param {Object} complaint - Mongoose Complaint document
 * @param {Object} [options] - Custom threshold overrides
 * @returns {Promise<Object>} Summary of action taken
 */
const processSingleComplaint = async (complaint, options = {}) => {
  const defaults = getDefaultThresholds();
  const followUpHours = options.followUpThresholdHours ?? defaults.followUpThresholdHours;
  const escalationHours = options.escalationThresholdHours ?? defaults.escalationThresholdHours;

  // Never process resolved complaints
  if (complaint.status === 'RESOLVED') {
    return {
      complaintId: complaint.complaintId,
      actionTaken: null,
      reason: 'Complaint is already resolved'
    };
  }

  // Calculate elapsed time from submission or creation
  const referenceTime = complaint.submittedAt || complaint.createdAt || new Date();
  const elapsedMs = Date.now() - new Date(referenceTime).getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // 1. ESCALATION CHECK (Higher threshold: 48h+)
  const isEligibleForEscalation = 
    elapsedHours >= escalationHours &&
    !complaint.escalation?.isEscalated &&
    complaint.status !== 'ESCALATED';

  if (isEligibleForEscalation) {
    // Find department to inspect escalationDepartmentId
    let dept = null;
    if (complaint.departmentId) {
      dept = await Department.findById(complaint.departmentId);
    }

    const previousStatus = complaint.status;

    // Update complaint escalation fields and status
    complaint.status = 'ESCALATED';
    complaint.escalation = {
      isEscalated: true,
      level: (complaint.escalation?.level || 0) + 1,
      reason: `Complaint unresolved beyond configured prototype threshold of ${escalationHours} hours.`,
      escalatedAt: new Date()
    };

    if (dept?.escalationDepartmentId) {
      complaint.departmentId = dept.escalationDepartmentId;
    }

    // Append statusHistory entry
    complaint.statusHistory.push({
      status: 'ESCALATED',
      changedBy: null,
      changedByRole: 'agent',
      note: `Autonomous agent escalation: unresolved after ${elapsedHours.toFixed(1)} hours (threshold: ${escalationHours}h).`,
      timestamp: new Date()
    });

    await complaint.save();

    // Record AgentAction for traceability
    const agentAction = await AgentAction.create({
      complaintId: complaint._id,
      actionType: 'ESCALATION_INITIATED',
      result: `Complaint escalated to Level 1${dept?.escalationDepartmentId ? ' and routed to escalation authority' : ''}.`,
      reason: `Complaint remained unresolved for ${elapsedHours.toFixed(1)} hours, exceeding the ${escalationHours}h threshold.`,
      metadata: {
        elapsedHours: parseFloat(elapsedHours.toFixed(2)),
        escalationLevel: complaint.escalation.level,
        previousStatus,
        originalDepartmentId: dept?._id || null,
        escalatedToDepartmentId: dept?.escalationDepartmentId || null
      },
      timestamp: new Date()
    });

    return {
      complaintId: complaint.complaintId,
      actionTaken: 'ESCALATION_INITIATED',
      actionId: agentAction._id,
      elapsedHours: parseFloat(elapsedHours.toFixed(2))
    };
  }

  // 2. FOLLOW-UP CHECK (24h+)
  // Trigger follow-up if elapsed time reached and not yet triggered for this complaint
  const isEligibleForFollowUp =
    elapsedHours >= followUpHours &&
    (!complaint.followUp || (complaint.followUp.count || 0) === 0) &&
    complaint.status !== 'ESCALATED';

  if (isEligibleForFollowUp) {
    const nextCount = (complaint.followUp?.count || 0) + 1;

    complaint.followUp = {
      count: nextCount,
      lastTriggeredAt: new Date(),
      lastReason: 'Complaint remains unresolved beyond the configured prototype follow-up threshold.'
    };

    await complaint.save();

    // Record AgentAction for traceability
    const agentAction = await AgentAction.create({
      complaintId: complaint._id,
      actionType: 'FOLLOW_UP_INITIATED',
      result: 'Autonomous follow-up initiated for department authority review.',
      reason: 'Complaint remains unresolved beyond the configured prototype follow-up threshold.',
      metadata: {
        elapsedHours: parseFloat(elapsedHours.toFixed(2)),
        followUpCount: nextCount,
        currentStatus: complaint.status
      },
      timestamp: new Date()
    });

    return {
      complaintId: complaint.complaintId,
      actionTaken: 'FOLLOW_UP_INITIATED',
      actionId: agentAction._id,
      elapsedHours: parseFloat(elapsedHours.toFixed(2))
    };
  }

  return {
    complaintId: complaint.complaintId,
    actionTaken: null,
    reason: 'Threshold not met or action already executed',
    elapsedHours: parseFloat(elapsedHours.toFixed(2))
  };
};

/**
 * Query all unresolved complaints and evaluate each for follow-up/escalation.
 *
 * @param {Object} [options] - Threshold options
 * @returns {Promise<Object>} Scan results
 */
const checkAndProcessComplaints = async (options = {}) => {
  const unresolvedComplaints = await Complaint.find({
    status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] }
  });

  const processed = [];

  for (const complaint of unresolvedComplaints) {
    try {
      const result = await processSingleComplaint(complaint, options);
      if (result.actionTaken) {
        processed.push(result);
      }
    } catch (err) {
      console.error(`[AgentMonitor] Error processing complaint ${complaint.complaintId}:`, err.message);
      processed.push({
        complaintId: complaint.complaintId,
        error: err.message
      });
    }
  }

  return {
    scannedCount: unresolvedComplaints.length,
    actionsCount: processed.filter(p => p.actionTaken).length,
    details: processed
  };
};

// Scheduler state
let schedulerIntervalId = null;
let isProcessingCycle = false;

/**
 * Start the in-process periodic monitoring loop.
 *
 * @param {Object} [options]
 * @param {number} [options.intervalMs] - Polling interval in ms (default: 5 min or env)
 * @param {number} [options.followUpThresholdHours]
 * @param {number} [options.escalationThresholdHours]
 */
const startMonitoringScheduler = (options = {}) => {
  if (schedulerIntervalId) {
    return; // Already running
  }

  const intervalMs = options.intervalMs || 
    parseInt(process.env.MONITOR_INTERVAL_MS, 10) || 
    5 * 60 * 1000;

  console.log(`[AgentMonitor] Starting agent monitoring scheduler (interval: ${intervalMs}ms)`);

  const runSafeCycle = async () => {
    if (isProcessingCycle) {
      return; // Prevent overlapping runs
    }
    isProcessingCycle = true;
    try {
      const res = await checkAndProcessComplaints(options);
      if (res.actionsCount > 0) {
        console.log(`[AgentMonitor] Cycle completed: ${res.actionsCount} actions taken across ${res.scannedCount} complaints.`);
      }
    } catch (err) {
      console.error('[AgentMonitor] Scheduled cycle error:', err.message);
    } finally {
      isProcessingCycle = false;
    }
  };

  // Run initial cycle shortly after startup
  setTimeout(runSafeCycle, 2000);

  schedulerIntervalId = setInterval(runSafeCycle, intervalMs);
};

/**
 * Stop the periodic monitoring loop.
 */
const stopMonitoringScheduler = () => {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
    isProcessingCycle = false;
    console.log('[AgentMonitor] Stopped agent monitoring scheduler.');
  }
};

module.exports = {
  processSingleComplaint,
  checkAndProcessComplaints,
  startMonitoringScheduler,
  stopMonitoringScheduler,
  getDefaultThresholds
};
