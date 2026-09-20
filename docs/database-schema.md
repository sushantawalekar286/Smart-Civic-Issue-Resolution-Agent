# Database Schema Documentation

This document describes the locked MongoDB schema for the Smart Civic Issue Resolution Agent MVP.

## 1. Core Collections
The prototype relies on exactly four main collections:
- `users`
- `departments`
- `complaints`
- `agentActions`

---

## 2. User Schema (`users`)
Stores citizens, authorities, and admin accounts.

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Primary Key |
| `name` | String | Required |
| `email` | String | Required, Unique, Indexed |
| `passwordHash` | String | Required, Hidden by default |
| `role` | String | Enum: `citizen`, `authority`, `admin` |
| `departmentId` | ObjectId | Ref: `Department` (Null for citizen/admin) |
| `phone` | String | Optional |
| `avatarUrl` | String | Optional |
| `isActive` | Boolean | Default: `true` |
| `lastLoginAt` | Date | Optional |
| `createdAt` | Date | Automatically managed |
| `updatedAt` | Date | Automatically managed |

**Role Rules**:
- `citizen`: `departmentId` must be null. Publicly registrable.
- `authority`: `departmentId` is required. Created by admin.
- `admin`: `departmentId` must be null. Created by seed script or another admin.

---

## 3. Department Schema (`departments`)
Stores configuration for municipal departments.

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Primary Key |
| `code` | String | Required, Unique, Uppercase |
| `name` | String | Required |
| `description` | String | Optional |
| `issueTypes` | [String] | Array of supported issues (e.g. `Pothole`) |
| `contactEmail` | String | Optional |
| `escalationDepartmentId` | ObjectId | Ref: `Department` (Optional) |
| `isActive` | Boolean | Default: `true` |

---

## 4. Complaint Schema (`complaints`)
Stores citizen complaints, AI analysis, status history, and escalation tracking.

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Primary Key |
| `complaintId` | String | Required, Unique, Format: `CIV-YYYYMMDD-XXXX` |
| `citizenId` | ObjectId | Ref: `User`, Required |
| `issueType` | String | Enum: `Pothole`, `Road Damage`, etc. |
| `description` | String | Required |
| `inputMethod` | String | Enum: `text`, `image`, `voice`, `mixed` |
| `location` | Object | `{ latitude, longitude, address }` |
| `evidence` | [Object] | Array of `{ type, url, fileName, mimeType, uploadedAt }` |
| `severity` | String | Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `departmentId` | ObjectId | Ref: `Department`, Required |
| `assignedTo` | ObjectId | Ref: `User` (Optional) |
| `status` | String | Enum: `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED` |
| `aiAnalysis` | Object | Stores nested classification, evidence, and severity analysis |
| `statusHistory`| [Object] | Stores `{ status, changedBy, changedByRole, note, timestamp }` |
| `followUp` | Object | `{ count, lastTriggeredAt, lastReason }` |
| `escalation` | Object | `{ isEscalated, level, reason, escalatedAt }` |
| `submittedAt` | Date | Timestamp of submission |

**Lifecycle Rules**:
- `SUBMITTED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`
- Escalation path: `ASSIGNED` / `IN_PROGRESS` → `ESCALATED`

---

## 5. Agent Action Schema (`agentActions`)
Tracks every autonomous action performed by the agent for complete traceability.

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Primary Key |
| `complaintId` | ObjectId | Ref: `Complaint`, Required |
| `actionType` | String | Enum of agent actions (e.g. `ISSUE_CLASSIFIED`) |
| `result` | String | Description of the result |
| `reason` | String | Why the agent made this decision |
| `evidenceSummary` | String | Summary of evidence used |
| `metadata` | Object | Additional arbitrary data |
| `timestamp` | Date | Automatically managed |
