const mongoose = require('mongoose');

const agentActionSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: [
      "INPUT_RECEIVED",
      "ISSUE_CLASSIFIED",
      "EVIDENCE_ANALYZED",
      "LOCATION_ANALYZED",
      "SEVERITY_ASSESSED",
      "DEPARTMENT_MAPPED",
      "COMPLAINT_GENERATED",
      "COMPLAINT_SUBMITTED",
      "STATUS_CHECKED",
      "FOLLOW_UP_INITIATED",
      "ESCALATION_INITIATED"
    ],
    required: true
  },
  result: {
    type: String,
    default: ""
  },
  reason: {
    type: String,
    default: ""
  },
  evidenceSummary: {
    type: String,
    default: ""
  },
  metadata: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('AgentAction', agentActionSchema);
