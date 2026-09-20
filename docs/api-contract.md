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
*Note: Other APIs (Complaints, Authority, Admin) are deferred to later development steps.*
