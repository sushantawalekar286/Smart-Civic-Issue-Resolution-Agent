## Technology Stack

Frontend:

* React
* JavaScript
* Vite
* React Router

Backend:

* Node.js
* Express.js

Database:

* MongoDB
* Mongoose

AI:

* Gemini API

---

## FRONTEND ARCHITECTURE

Frontend should follow a modular structure:

client/src/

components/
pages/
layouts/
hooks/
services/
context/
routes/
utils/
assets/

Principles:

* Pages represent screens.
* Components represent reusable UI.
* Services contain API calls.
* Hooks contain reusable React logic.
* Context contains global state where appropriate.
* Routes contain routing configuration.
* Utils contain reusable helper functions.

Do not put API calls directly throughout UI components.

Prefer:

component/page
↓
service
↓
backend API

---

## BACKEND ARCHITECTURE

Backend should follow:

routes
↓
controllers
↓
services
↓
models

Structure:

server/src/

controllers/
routes/
models/
services/
middleware/
validators/
utils/
config/

Rules:

### Routes

Define API endpoints.

### Controllers

Handle HTTP request/response logic.

### Services

Contain business logic.

### Models

Contain MongoDB/Mongoose schemas.

### Middleware

Authentication, authorization, validation, error handling, etc.

### Validators

Validate incoming data.

Do not put large business logic directly inside route files.

---

## AI ARCHITECTURE

AI logic must be modular.

Do NOT create one giant AI file.

Future AI services should be separated into modules such as:

complaintClassification.service.js
evidenceAnalysis.service.js
severityAssessment.service.js
departmentMapping.service.js
complaintGeneration.service.js
followUp.service.js
escalation.service.js
agentOrchestrator.service.js

These files should only be created when the corresponding feature is implemented.

The AI orchestration layer should coordinate services rather than containing every piece of logic itself.

---

## AGENTIC WORKFLOW

The project is an Agentic AI system.

The future architecture should support:

Citizen Input
↓
Issue Classification
↓
Evidence Analysis
↓
Location Analysis
↓
Severity Assessment
↓
Department Mapping
↓
Structured Complaint Generation
↓
Complaint Submission
↓
Status Tracking
↓
Follow-up
↓
Escalation when required
↓
Resolution

Each stage should be independently testable.

Do not implement this workflow during the current setup task.

---

## DATABASE RULES

MongoDB schemas should be created only when the corresponding feature is implemented.

Keep models modular.

Do not create one huge schema containing unrelated data.

Use Mongoose models.

Validate important user input before saving to the database.

---

## ERROR HANDLING

Backend should eventually use centralized error handling.

Do not expose:

* API keys
* stack traces
* database credentials
* internal secrets

to the frontend/user in production responses.

Use appropriate HTTP status codes.

---

## SECURITY

Future implementation must consider:

* Input validation
* Authentication
* Authorization
* Rate limiting where appropriate
* Secure environment variables
* File upload validation
* API key protection
* MongoDB injection prevention
* Safe error responses

Do not add security mechanisms unrelated to the current task unless required.

---

## DOCUMENTATION

Important architecture decisions should be documented in:

docs/

Expected files include:

docs/problem-statement.md
docs/architecture.md
docs/api-contract.md
docs/database-schema.md
docs/team-ownership.md
docs/development-workflow.md

Do not create fake documentation claiming features are implemented.

---

## CODE QUALITY

Prefer:

* Small functions
* Clear naming
* Modular files
* Reusable components
* Reusable services
* Consistent error handling
* Minimal duplication

Avoid:

* Giant files
* Giant functions
* Hardcoded data
* Duplicate business logic
* Unnecessary dependencies
* Unnecessary abstractions
* Unrelated refactoring

---

## HACKATHON PRIORITY

This is a 24-hour hackathon.

Therefore prioritize:

1. Working functionality
2. Core problem statement requirements
3. Reliable demo flow
4. Integration between modules
5. Clear architecture
6. Testing
7. UI polish

Do NOT spend excessive time on unnecessary architecture or abstractions.

Build the simplest reliable implementation that satisfies the requirement.

---

## IMPORTANT ANTIGRAVITY BEHAVIOR

Before implementing any future feature:

1. Inspect the repository.
2. Read these rules.
3. Check the current Git branch.
4. Check existing changes.
5. Identify the correct module.
6. Avoid unrelated files.
7. Implement modularly.
8. Test the change.
9. Report changed files and integration notes.

If requirements conflict with these rules, prioritize:

* Existing working code
* Existing API contracts
* Existing developer work
* Problem statement requirements

Ask for clarification when a change could destroy another developer's work.

---

## MVP Scope Protection

Future developers and agents must:

* prioritize P0 functionality
* avoid implementing P1/P2 features before P0 is stable
* avoid unnecessary architecture complexity
* avoid creating unrelated modules
* avoid overengineering
* preserve the end-to-end complaint workflow
* keep AI reasoning separate from deterministic application actions
* keep the official problem requirements traceable to implementation

The MVP specification in:

docs/mvp-requirements.md

should be treated as the source of truth for hackathon scope.

---

## Architecture Freeze

For the hackathon, the following are frozen:

### Roles
citizen
authority
admin

### Core collections
users
departments
complaints
agentActions

### Backend architecture
routes
→ controllers
→ services
→ models

### Frontend architecture
pages
→ components
→ services
→ hooks/context

### Complaint lifecycle
SUBMITTED
→ ASSIGNED
→ IN_PROGRESS
→ RESOLVED

with escalation path:
ASSIGNED / IN_PROGRESS
→ ESCALATED

Architectural changes require explicit approval from the project lead.
Bug fixes and implementation improvements are allowed.

---

## Database Schema Freeze

The schema documented in:
docs/database-schema.md
is the source of truth.

Do not independently create alternative:
- User schemas
- Complaint schemas
- Department schemas
- Agent action schemas
- authentication collections
- status collections
- timeline collections

Any required schema change must first be discussed with the project lead.
