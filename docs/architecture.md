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

---

## 3. Authority Workflow & Complaint Status Management (Step 6)

The authority workflow enables departmental officials to review citizen complaints assigned to their jurisdiction and manage issue resolution lifecycles under strict access control.

```
Authenticated Authority (req.user)
  ↓
Department-Scoped Isolation (req.user.departmentId)
  ↓
Department Complaint Queue (GET /api/v1/authority/complaints)
  ↓
Review Details & Read-Only AI Analysis (GET /api/v1/authority/complaints/:id)
  ↓
Status Transition Validation (PATCH /api/v1/authority/complaints/:id/status)
  ↓
Automatic Assignment (assignedTo = req.user._id on SUBMITTED → ASSIGNED)
  ↓
statusHistory[] Audit Entry Appended
```

### Key Principles & Lifecycle Rules

1. **Strict Department Boundaries**:
   - Authority users can only view and update complaints belonging directly to their assigned department (`complaint.departmentId === req.user.departmentId`).
   - Cross-department operations are rejected with `403 Forbidden`. Frontend-supplied department IDs are never trusted.

2. **Frozen Status Lifecycle Transitions**:
   - `SUBMITTED → ASSIGNED`
   - `ASSIGNED → IN_PROGRESS`
   - `IN_PROGRESS → RESOLVED` (strictly requires resolution note)
   - `ASSIGNED → ESCALATED` (manual supervisor escalation)
   - `IN_PROGRESS → ESCALATED` (manual supervisor escalation)
   - Arbitrary status jumps or reopening resolved/escalated complaints are rejected with `400 Bad Request`.

3. **Status History Tracking**:
   - Every status modification is recorded immutably in `complaint.statusHistory[]` with `status`, `changedBy`, `changedByRole: 'authority'`, `note`, and `timestamp`.

4. **Read-Only AI Intelligence**:
   - Authorities inspect classification, severity reasoning, and evidence analysis provided by the frozen AI pipeline.
   - Authorities are strictly forbidden from modifying AI-generated outputs or recommendations.
