# Authentication API Contract

## Overview

This document outlines the API contract for authentication management, which includes user registration, login, OAuth callback handling, and profile retrieval. The system supports both traditional email/password authentication and OAuth providers (Apple, LinkedIn).

## Base URL

All authentication endpoints use the base path: `/api/auth`

---

## Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Registers a new user with email and password authentication.

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "auth_provider": "EMAIL|APPLE|LINKEDIN",
  "email": "string",
  "password": "string",
  "username": "string",
  "name": "string",
  "is_active": "boolean|optional"
}
```

**Request Fields:**
- `auth_provider` - Authentication provider (optional, defaults to EMAIL)
- `email` - User's email address (required)
- `password` - User's password (required, min 6 chars, must contain number)
- `username` - Unique username (required)
- `name` - User's full name (required)
- `is_active` - Account status (optional, defaults to true)

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "auth_provider": "EMAIL",
      "email": "string",
      "username": "string",
      "name": "string",
      "linkedinUsername": "string|null",
      "photoLink": "string|null",
      "professionId": "uuid|null",
      "is_active": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "token": "jwt_token"
  }
}
```

**Business Logic:**
- Validates email uniqueness
- Hashes password before storage
- Generates JWT token for immediate authentication
- Returns complete user profile with token

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user with email and password.

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Request Fields:**
- `email` - User's email address (required)
- `password` - User's password (required)

**Response (Success):**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "auth_provider": "EMAIL",
      "email": "string",
      "username": "string",
      "name": "string",
      "linkedinUsername": "string|null",
      "photoLink": "string|null",
      "professionId": "uuid|null",
      "is_active": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "token": "jwt_token"
  }
}
```

**Business Logic:**
- Validates email and password combination
- Checks if user account is active
- Generates JWT token for session management
- Returns complete user profile with token

---

### 3. OAuth Callback

**Endpoint:** `POST /api/auth/callback`

**Description:** Handles OAuth authentication callback from Supabase for Apple, LinkedIn, and other OAuth providers. Creates new users or authenticates existing users.

**Headers:**
- `Authorization: Bearer <supabase_token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{}
```

**Note:** No request body required. All user data is extracted from the Supabase token in the Authorization header.

**Response (Existing User):**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "auth_provider": "APPLE|LINKEDIN",
      "email": "string",
      "username": "string|null",
      "name": "string",
      "linkedinUsername": "string|null",
      "photoLink": "string|null",
      "professionId": "uuid|null",
      "is_active": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime",
      "isFirst": false
    },
    "token": "jwt_token"
  }
}
```

**Response (New User):**
```json
{
  "message": "User created and logged in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "auth_provider": "APPLE|LINKEDIN",
      "email": "string",
      "username": "string|null",
      "name": "string",
      "linkedinUsername": "string|null",
      "photoLink": "string|null",
      "professionId": "uuid|null",
      "is_active": "boolean",
      "created_at": "datetime",
      "updated_at": "datetime",
      "isFirst": true
    },
    "token": "jwt_token"
  }
}
```

**Business Logic:**
1. Verifies Supabase token and extracts user data
2. Checks if user exists by email in local database
3. **If existing user:**
   - Updates user information from OAuth provider
   - Returns 200 status with "Login successful" message
   - Sets `isFirst: false` in user response
4. **If new user:**
   - Creates new user account with OAuth provider data
   - Determines auth_provider from Supabase metadata
   - Sets account as active by default
   - Returns 201 status with "User created and logged in successfully" message
   - Sets `isFirst: true` in user response
5. Generates JWT token for session management
6. Returns complete user profile with token and signup flag

---

### 4. Get Profile

**Endpoint:** `GET /api/auth/profile`

**Description:** Retrieves the current authenticated user's profile information.

**Headers:**
- `Authorization: Bearer <jwt_token>` (required)

**Response (Success):**
```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "auth_provider": "EMAIL|APPLE|LINKEDIN",
    "email": "string",
    "username": "string|null",
    "name": "string",
    "linkedinUsername": "string|null",
    "photoLink": "string|null",
    "professionId": "uuid|null",
    "is_active": "boolean",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Business Logic:**
- Validates JWT token from Authorization header
- Retrieves user data from database
- Returns complete profile excluding password hash

---

## Authentication Providers

| Provider | Description | Token Source |
|----------|-------------|--------------|
| `EMAIL` | Traditional email/password | Generated JWT |
| `APPLE` | Apple Sign-In via Supabase | Supabase OAuth token |
| `LINKEDIN` | LinkedIn OAuth via Supabase | Supabase OAuth token |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Registration failed",
  "details": [
    {
      "field": "email",
      "message": "Email already in use"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Login failed",
  "details": [
    {
      "field": "credentials",
      "message": "Invalid email or password"
    }
  ]
}
```

### 401 Authentication Required
```json
{
  "error": "Authentication required",
  "details": [
    {
      "field": "token",
      "message": "No token provided"
    }
  ]
}
```

### 401 Invalid Token
```json
{
  "error": "Authentication failed",
  "details": [
    {
      "field": "token",
      "message": "Invalid or expired token"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Registration failed",
  "details": [
    {
      "field": "server",
      "message": "An error occurred during registration"
    }
  ]
}
```

---

## Token Management

### JWT Token Structure
- **Payload**: Contains user ID and email
- **Expiration**: Set according to security policy
- **Usage**: Include in Authorization header as `Bearer <token>`

### Supabase Token Handling
- **OAuth Callback**: Accepts Supabase token in Authorization header
- **Verification**: Validates token with Supabase service
- **User Data**: Extracts user metadata and app metadata
- **Provider Detection**: Determines OAuth provider from token metadata

---

## Implementation Notes

### Security Considerations
- Passwords are hashed using secure algorithms
- JWT tokens include user identification data
- Supabase tokens are verified with Supabase service
- OAuth users are automatically set as active
- Email uniqueness is enforced across all providers

### OAuth Flow
1. User initiates OAuth with Apple/LinkedIn via frontend
2. Frontend receives Supabase token after successful OAuth
3. Frontend calls `/api/auth/callback` with Supabase token
4. Backend verifies token and creates/updates user
5. Backend returns JWT token for subsequent API calls

### User Data Handling
- **New OAuth Users**: Created with provider metadata
- **Existing Users**: Updated with latest OAuth information
- **Email Matching**: Users are matched by email across providers
- **Profile Completion**: OAuth users may need to complete profile later

### Performance Considerations
- Database queries optimized for email lookup
- JWT token generation is lightweight
- Supabase token verification is cached where possible
- User profile data is efficiently structured

### Future Enhancements
- Refresh token implementation
- Multi-factor authentication support
- Social login provider expansion
- Account linking across providers
- Session management improvements
- Password reset functionality
