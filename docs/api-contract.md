# API Contract

This document defines the API contracts implemented for the application foundation.

## Base URL
`/api/v1`

---

## Authentication APIs

### 1. Register Citizen
**POST /auth/register**

Allows public registration of a citizen account.

**Request Body**
```json
{
  "name": "Citizen Name",
  "email": "citizen@example.com",
  "password": "strongpassword123"
}
```

**Response (201 Created)**
```json
{
  "_id": "60d5ec49c1234567890abcdef",
  "name": "Citizen Name",
  "email": "citizen@example.com",
  "role": "citizen"
}
```
*Note: This endpoint also sets an HTTP-only JWT cookie.*

---

### 2. Login
**POST /auth/login**

Authenticates a user and sets the session cookie.

**Request Body**
```json
{
  "email": "citizen@example.com",
  "password": "strongpassword123"
}
```

**Response (200 OK)**
```json
{
  "_id": "60d5ec49c1234567890abcdef",
  "name": "Citizen Name",
  "email": "citizen@example.com",
  "role": "citizen",
  "departmentId": null
}
```
*Note: Sets an HTTP-only JWT cookie.*

---

### 3. Logout
**POST /auth/logout**

Clears the authentication cookie.

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Get Current User
**GET /auth/me**

Retrieves the authenticated user's profile based on the JWT cookie. Requires Authentication.

**Headers**
- `Cookie: jwt=<token>` or `Authorization: Bearer <token>`

**Response (200 OK)**
```json
{
  "_id": "60d5ec49c1234567890abcdef",
  "name": "Citizen Name",
  "email": "citizen@example.com",
  "role": "citizen",
  "departmentId": null,
  "isActive": true,
  "createdAt": "2026-09-20T00:00:00.000Z",
  "updatedAt": "2026-09-20T00:00:00.000Z"
}
```

---

## Complaint Intake APIs

### 1. Analyze Complaint Intake (Step 3 payload validation)
**POST /complaints/analyze**

Validates and prepares the citizen complaint input for the AI analysis pipeline. DOES NOT create a database record.

**Headers**
- `Cookie: jwt=<token>` or `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Role Required:** `citizen`

**Request Body (FormData)**
- `description` (String, required): Detailed description of the civic issue (10-1000 chars).
- `location` (JSON String, required): JSON object with `{ latitude: float, longitude: float, address: string }`.
- `image` (File, optional): Uploaded image (JPEG, PNG, WEBP), max 5MB.

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "description": "There is a large pothole near the college entrance.",
    "inputMethod": "mixed",
    "location": {
      "latitude": 16.7,
      "longitude": 74.2,
      "address": ""
    },
    "evidence": [
      {
        "type": "image",
        "url": "https://res.cloudinary.com/...",
        "fileName": "pothole.jpg",
        "mimeType": "image/jpeg"
      }
    ],
    "aiAnalysis": {
      "issueType": "Pothole",
      "classificationConfidence": 0.92,
      "evidenceAnalysis": {
        "summary": "Analysis based on citizen description and attached photographic evidence (pothole.jpg).",
        "findings": [
          "Citizen reported: \"There is a large pothole near the college entrance.\"",
          "Photographic evidence provided (pothole.jpg) confirms visual documentation submitted by citizen."
        ]
      },
      "locationAnalysis": {
        "summary": "GPS coordinates provided (16.7000, 74.2000). No street address was provided with the complaint."
      },
      "severity": {
        "level": "HIGH",
        "reason": "Complaint indicates significant physical impact, active leakage, or elevated risk of accident."
      },
      "department": {
        "code": "ROAD",
        "name": "Road / Public Works Department",
        "reason": "Issue type \"Pothole\" is mapped to the Road / Public Works Department (ROAD) based on municipal jurisdiction responsibilities."
      },
      "generatedComplaint": "Issue:\nPothole\n\nLocation:\nGPS (16.7000, 74.2000)\n\nSeverity:\nHigh\n\nDescription:\nThere is a large pothole near the college entrance."
    }
  }
}
```

**Response Errors (400 Bad Request / 422 Unprocessable)**
- `400 Bad Request`: Validation failure (e.g. "Please describe the civic issue." or "Unsupported image format.").
- `401 Unauthorized`: Unauthenticated.
- `403 Forbidden`: Authenticated as non-citizen.
- `422 Unprocessable Entity`: AI output validation failure.

---
*Note: Step 4 AI Analysis is integrated into `/complaints/analyze`. Citizen Review and final Complaint creation occur in Step 5.*

---

## Authority Workflow APIs (Step 6)

All Authority APIs strictly require authentication and the `authority` role. Department-level isolation is enforced via `req.user.departmentId`.

### 1. List Department Complaints
**GET /authority/complaints**

Retrieves all complaints belonging strictly to the authenticated authority's department, with optional filters and department summary statistics.

**Headers**
- `Cookie: jwt=<token>` or `Authorization: Bearer <token>`

**Role Required:** `authority`

**Query Parameters (Optional)**
- `status` (String): Filter by status (`SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `ESCALATED`).
- `severity` (String): Filter by severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `issueType` (String): Filter by issue type.

**Response (200 OK)**
```json
{
  "success": true,
  "count": 2,
  "stats": {
    "total": 5,
    "submitted": 2,
    "assigned": 1,
    "inProgress": 1,
    "resolved": 1,
    "escalated": 0
  },
  "data": [
    {
      "_id": "664fa1234567890abcdef12",
      "complaintId": "CMP-2026-0001",
      "issueType": "Pothole",
      "severity": "HIGH",
      "status": "SUBMITTED",
      "location": {
        "latitude": 18.5204,
        "longitude": 73.8567,
        "address": "FC Road, Pune"
      },
      "departmentId": {
        "_id": "664fa1234567890abcdef01",
        "code": "ROAD",
        "name": "Road / Public Works Department"
      },
      "assignedTo": null,
      "createdAt": "2026-09-20T10:00:00.000Z"
    }
  ]
}
```

**Errors**
- `401 Unauthorized`: Unauthenticated request.
- `403 Forbidden`: Authenticated user is not an `authority` or has no associated `departmentId`.
- `400 Bad Request`: Invalid filter query parameter value.

---

### 2. Get Department Complaint Details
**GET /authority/complaints/:complaintId**

Retrieves full details of a specific complaint belonging to the authenticated authority's department.

**Headers**
- `Cookie: jwt=<token>` or `Authorization: Bearer <token>`

**Role Required:** `authority`

**URL Parameters**
- `complaintId` (String, required): Complaint identifier (or MongoDB `_id`).

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "_id": "664fa1234567890abcdef12",
    "complaintId": "CMP-2026-0001",
    "citizenId": {
      "_id": "664fa1234567890abcdef05",
      "name": "Citizen User",
      "email": "citizen@example.com"
    },
    "issueType": "Pothole",
    "description": "Deep pothole in the left lane causing hazards.",
    "inputMethod": "mixed",
    "location": {
      "latitude": 18.5204,
      "longitude": 73.8567,
      "address": "FC Road, Pune"
    },
    "evidence": [
      {
        "type": "image",
        "url": "https://res.cloudinary.com/...",
        "fileName": "pothole.jpg"
      }
    ],
    "severity": "HIGH",
    "status": "SUBMITTED",
    "departmentId": {
      "_id": "664fa1234567890abcdef01",
      "code": "ROAD",
      "name": "Road / Public Works Department"
    },
    "assignedTo": null,
    "aiAnalysis": {
      "classification": { "issueType": "Pothole", "confidence": 0.95 },
      "severityAnalysis": { "severity": "HIGH", "reason": "Accident hazard" },
      "departmentAnalysis": { "departmentName": "Road / Public Works Department" },
      "generatedComplaint": "Pothole on FC Road."
    },
    "statusHistory": [
      {
        "status": "SUBMITTED",
        "changedByRole": "citizen",
        "note": "Initial submission",
        "timestamp": "2026-09-20T10:00:00.000Z"
      }
    ]
  }
}
```

**Errors**
- `401 Unauthorized`: Unauthenticated.
- `403 Forbidden`: Authenticated user is not an `authority` or complaint belongs to a different department.
- `404 Not Found`: Complaint not found.

---

### 3. Update Complaint Status
**PATCH /authority/complaints/:complaintId/status**

Updates the lifecycle status of a department complaint and records an immutable audit entry in `statusHistory`.

**Headers**
- `Cookie: jwt=<token>` or `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Role Required:** `authority`

**Status Lifecycle Rules**
Allowed status transitions:
- `SUBMITTED → ASSIGNED` (automatically assigns `assignedTo = req.user._id`)
- `ASSIGNED → IN_PROGRESS`
- `IN_PROGRESS → RESOLVED` (strictly requires `note`, min 5 chars)
- `ASSIGNED → ESCALATED` (manual authority escalation)
- `IN_PROGRESS → ESCALATED` (manual authority escalation)

All other transitions (e.g. `RESOLVED → *`, `ESCALATED → *`, `SUBMITTED → RESOLVED`) are rejected with `400 Bad Request`.

**Request Body**
```json
{
  "status": "IN_PROGRESS",
  "note": "Maintenance team has arrived on site and started asphalt repairs."
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Complaint status updated to IN_PROGRESS",
  "data": {
    "complaintId": "CMP-2026-0001",
    "status": "IN_PROGRESS",
    "assignedTo": {
      "_id": "664fa1234567890abcdef88",
      "name": "Road Officer",
      "email": "officer@municipal.gov"
    },
    "statusHistory": [
      {
        "status": "SUBMITTED",
        "changedByRole": "citizen",
        "note": "Initial submission",
        "timestamp": "2026-09-20T10:00:00.000Z"
      },
      {
        "status": "ASSIGNED",
        "changedByRole": "authority",
        "note": "Assigned to department authority",
        "timestamp": "2026-09-20T10:15:00.000Z"
      },
      {
        "status": "IN_PROGRESS",
        "changedByRole": "authority",
        "note": "Maintenance team has arrived on site and started asphalt repairs.",
        "timestamp": "2026-09-20T11:00:00.000Z"
      }
    ]
  }
}
```

**Errors**
- `400 Bad Request`:
  - Missing or invalid status string.
  - Invalid status transition (e.g., trying to jump from `SUBMITTED` directly to `RESOLVED`, or reopen `RESOLVED`).
  - Missing or too short note when transitioning to `RESOLVED` (requires min 5 chars).
  - Note exceeding 500 characters.
- `401 Unauthorized`: Unauthenticated.
- `403 Forbidden`: Authenticated user is not an `authority` or complaint belongs to a different department.
- `404 Not Found`: Complaint does not exist.
