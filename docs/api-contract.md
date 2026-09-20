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
    ]
  }
}
```

**Response Errors (400 Bad Request)**
- `400 Bad Request`: Validation failure (e.g. "Please describe the civic issue." or "Unsupported image format.").
- `401 Unauthorized`: Unauthenticated.
- `403 Forbidden`: Authenticated as non-citizen.

---
*Note: AI analysis step and Admin/Authority APIs are deferred to later development steps.*
