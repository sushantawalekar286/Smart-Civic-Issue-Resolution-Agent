const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  issueType: {
    type: String,
    enum: [
      "Pothole",
      "Road Damage",
      "Garbage",
      "Damaged Streetlight",
      "Water Leakage",
      "Drainage",
      "Public Infrastructure Damage",
      "Other"
    ],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  inputMethod: {
    type: String,
    enum: ["text", "image", "voice", "mixed"],
    required: true,
    default: "text"
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      default: ""
    }
  },
  evidence: [
    {
      type: {
        type: String,
        enum: ["image", "audio"],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        default: ""
      },
      fileName: {
        type: String,
        default: ""
      },
      mimeType: {
        type: String,
        default: ""
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    required: true,
    index: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: [
      "SUBMITTED",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "ESCALATED"
    ],
    required: true,
    default: "SUBMITTED",
    index: true
  },
  aiAnalysis: {
    classification: {
      issueType: {
        type: String,
        default: null
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null
      },
      reason: {
        type: String,
        default: ""
      }
    },
    evidenceAnalysis: {
      summary: {
        type: String,
        default: ""
      },
      findings: {
        type: [String],
        default: []
      }
    },
    locationAnalysis: {
      summary: {
        type: String,
        default: ""
      }
    },
    severityAnalysis: {
      severity: {
        type: String,
        default: null
      },
      reason: {
        type: String,
        default: ""
      }
    },
    departmentAnalysis: {
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null
      },
      departmentName: {
        type: String,
        default: ""
      },
      reason: {
        type: String,
        default: ""
      }
    },
    generatedComplaint: {
      type: String,
      default: ""
    },
    model: {
      type: String,
      default: ""
    },
    analyzedAt: {
      type: Date,
      default: null
    }
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: [
          "SUBMITTED",
          "ASSIGNED",
          "IN_PROGRESS",
          "RESOLVED",
          "ESCALATED"
        ],
        required: true
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      },
      changedByRole: {
        type: String,
        enum: [
          "citizen",
          "authority",
          "admin",
          "agent",
          "system"
        ],
        required: true
      },
      note: {
        type: String,
        default: ""
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  followUp: {
    count: {
      type: Number,
      default: 0
    },
    lastTriggeredAt: {
      type: Date,
      default: null
    },
    lastReason: {
      type: String,
      default: null
    }
  },
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    level: {
      type: Number,
      default: 0
    },
    reason: {
      type: String,
      default: null
    },
    escalatedAt: {
      type: Date,
      default: null
    }
  },
  submittedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
