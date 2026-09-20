# API Contract

## Step 3 & 4: Complaint Intake & Analyze
`POST /api/v1/complaints/analyze`
Returns AI analysis + `analysisToken` (Step 4 integration pending).

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


## Step 5: Complaint Submission
`POST /api/v1/complaints`
Accepts `analysisToken` from Step 4.
*(Step 5 — pending Step 4 integration)*

