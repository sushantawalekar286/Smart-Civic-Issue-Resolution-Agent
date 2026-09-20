# Agentic Monitoring, Follow-up & Escalation Workflow

This document details the autonomous agent monitoring workflow implemented in Step 7 for the Smart Civic Issue Resolution Agent (Prarambha 2.0 Hackathon).

---

## 1. Overview

The monitoring service periodically evaluates all unresolved complaints (`SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`) against SLA thresholds:
1. **Follow-up Trigger (24 Hours)**: Automatically flags unresolved complaints and records an autonomous follow-up action for departmental authorities.
2. **Escalation Trigger (48 Hours)**: Automatically escalates unresolved complaints to Level 1, updates status to `ESCALATED`, re-routes to the designated escalation department (if configured), and updates status history.
3. **Traceability**: All autonomous decisions are logged to the existing `agentActions` collection (`FOLLOW_UP_INITIATED`, `ESCALATION_INITIATED`).

---

## 2. Thresholds & Configuration

Default prototype values are defined in `server/.env`:

| Environment Variable | Default Value | Description |
|---|---|---|
| `FOLLOW_UP_THRESHOLD_HOURS` | `24` | Hours before an autonomous follow-up is triggered. |
| `ESCALATION_THRESHOLD_HOURS` | `48` | Hours before an autonomous escalation is triggered. |
| `MONITOR_INTERVAL_MS` | `300000` | In-process scheduler polling frequency (5 minutes). |
| `ENABLE_AGENT_MONITOR` | `true` | Enables/disables the background agent monitoring scheduler loop. |

> [!NOTE]
> These thresholds represent prototype configuration values for the hackathon demonstration, not official statutory SLAs.

---

## 3. Workflow Rules & Idempotency

- **Unresolved Only**: Only complaints in `SUBMITTED`, `ASSIGNED`, or `IN_PROGRESS` are monitored.
- **Resolved Complaints**: Complaints in `RESOLVED` are permanently ignored—they will never receive follow-up or escalation.
- **Duplicate Prevention (Idempotent)**:
  - **Follow-up**: Triggered at most once per unresolved cycle (`complaint.followUp.count === 0`).
  - **Escalation**: Once escalated, `complaint.escalation.isEscalated = true` and `status = ESCALATED`. Subsequent monitoring cycles ignore already-escalated complaints.
- **Department Re-routing**: If `department.escalationDepartmentId` is defined, the complaint is re-assigned to the higher department. If null, escalation still completes safely without error.

---

## 4. API Reference: Traceability

### GET `/api/v1/complaints/:complaintId/agent-actions`
Returns all autonomous actions performed by the agent for a specific complaint.

- **Access**: Private (`admin`, or `authority` belonging to the complaint's assigned department).
- **Sample Response**:
```json
{
  "success": true,
  "complaintId": "CIV-20260920-0001",
  "count": 2,
  "data": [
    {
      "_id": "6aafa6...",
      "actionType": "ESCALATION_INITIATED",
      "result": "Complaint escalated to Level 1 and routed to escalation authority.",
      "reason": "Complaint remained unresolved for 48.5 hours, exceeding the 48h threshold.",
      "metadata": {
        "elapsedHours": 48.5,
        "escalationLevel": 1,
        "previousStatus": "ASSIGNED",
        "originalDepartmentId": "...",
        "escalatedToDepartmentId": "..."
      },
      "timestamp": "2026-09-20T12:00:00.000Z"
    },
    {
      "_id": "6aafa5...",
      "actionType": "FOLLOW_UP_INITIATED",
      "result": "Autonomous follow-up initiated for department authority review.",
      "reason": "Complaint remains unresolved beyond the configured prototype follow-up threshold.",
      "metadata": {
        "elapsedHours": 24.2,
        "followUpCount": 1,
        "currentStatus": "ASSIGNED"
      },
      "timestamp": "2026-09-20T00:00:00.000Z"
    }
  ]
}
```

---

## 5. Rapid Hackathon Manual Demo

To demonstrate the full monitoring, follow-up, and escalation lifecycle without waiting 24 or 48 real hours:

### Step 1: Configure Fast Thresholds in `server/.env`
```env
FOLLOW_UP_THRESHOLD_HOURS=0.01
ESCALATION_THRESHOLD_HOURS=0.02
MONITOR_INTERVAL_MS=10000
```
- `0.01` hours = 36 seconds
- `0.02` hours = 72 seconds
- `MONITOR_INTERVAL_MS=10000` = 10 second polling

### Step 2: Submit a New Complaint as Citizen
1. Log in as a citizen (`citizen@civic.local` / `citizenpassword`).
2. Submit a complaint via the Citizen UI (`/citizen/report`). Status begins as `SUBMITTED`.

### Step 3: Observe Autonomous Agent Actions
1. **At ~36 seconds**:
   - The monitoring scheduler detects elapsed time >= 0.01h.
   - Triggers `FOLLOW_UP_INITIATED`.
   - `complaint.followUp.count` becomes `1`.
2. **At ~72 seconds**:
   - The monitoring scheduler detects elapsed time >= 0.02h.
   - Triggers `ESCALATION_INITIATED`.
   - `complaint.status` automatically updates to `ESCALATED`.
   - `statusHistory` records an entry with `changedByRole: 'agent'`.
3. View the full trace via:
   `GET /api/v1/complaints/:complaintId/agent-actions` with authority or admin token.
