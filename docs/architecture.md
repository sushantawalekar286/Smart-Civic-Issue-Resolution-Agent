# Architecture

## 1. Frozen Architecture Setup

For the hackathon, the following architectural choices are FROZEN:

### Frontend
- React, Vite, React Router
- Component-based structure with Context API for state management.
- Routes split by Role (`citizen`, `authority`, `admin`).

### Backend
- Node.js, Express.js
- Modular Monolith (Routes → Controllers → Services → Models)
- RESTful APIs
- JSON Web Token (JWT) in HTTP-only cookies for authentication.

### Database
- MongoDB, Mongoose
- Exactly 4 core collections: `users`, `departments`, `complaints`, `agentActions`.

### Roles
- `citizen`
- `authority`
- `admin`

### Complaint Lifecycle
`SUBMITTED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`
*(Escalation path: `ASSIGNED` / `IN_PROGRESS` → `ESCALATED`)*

> [!WARNING]
> Architectural changes require explicit approval from the project lead. Bug fixes and implementation improvements are allowed.


### Citizen Intake Flow (Step 3 to 4)
Citizen
↓
Report Issue UI
↓
Evidence Upload
↓
Location Capture
↓
Validation
↓
Standardized Complaint Input
↓
STEP 4 AI Analysis

---

## 2. AI Complaint Analysis Pipeline (Step 4)

The AI analysis pipeline follows an agentic, modular reasoning workflow coordinating 9 dedicated services:

```
Standardized Complaint Intake Input
  ↓
Agent Orchestrator (server/src/services/ai/agentOrchestrator.service.js)
  ↓
1. Issue Classification (classifyIssue.service.js)
  ↓
2. Evidence Analysis (analyzeEvidence.service.js)
  ↓
3. Location Analysis (analyzeLocation.service.js)
  ↓
4. Severity Assessment (assessSeverity.service.js)
  ↓
5. Department Mapping (mapDepartment.service.js)
  ↓
6. Structured Complaint Generation (generateComplaint.service.js)
  ↓
7. Strict Output Validation (validateAiOutput.js)
  ↓
Validated Structured AI Result
```

### Safety Guarantees
- **No Hallucinated Evidence**: Analysis of photos is grounded only when images are supplied; missing photos explicitly reported without fabrication.
- **No Invented Addresses**: Location analysis only reflects supplied coordinates and address.
- **Strict Department Scoping**: AI cannot invent arbitrary department names; resolutions map strictly to registered department codes (`ROAD`, `SANITATION`, `ELECTRICAL`, `WATER`, `DRAINAGE`, `INFRASTRUCTURE`).
- **No Premature Persistence**: Step 4 does not create final Complaint records in MongoDB. Persistence occurs in Step 5 after citizen review.
