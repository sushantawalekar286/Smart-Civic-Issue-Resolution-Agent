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
