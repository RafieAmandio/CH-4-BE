# User API Contract

## Overview

This document outlines the API contract for user management, which includes profile management and user event history. The user system supports both authenticated profile management and public profile viewing.

## Base URL

All user endpoints use the base path: `/api/users`

---

## Endpoints

### 1. Get My Profile

**Endpoint:** `GET /api/users/me`

**Description:** Retrieves the current authenticated user's complete profile information.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (Success):**
```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "username": "string|null",
    "linkedinUsername": "string|null",
    "photoLink": "string|null",
    "profession": {
      "id": "uuid",
      "name": "string",
      "categoryName": "string"
    } | null
  }
}
```

**Response Fields:**
- `id` - User identifier
- `name` - User's full name
- `email` - User's email address
- `username` - User's unique username
- `linkedinUsername` - LinkedIn profile username
- `photoLink` - Profile photo URL
- `profession` - User's profession details (if set)

---

### 2. Update My Profile

**Endpoint:** `PUT /api/users/me`

**Description:** Updates the current authenticated user's profile information.

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string|optional",
  "username": "string|optional",
  "linkedinUsername": "string|optional",
  "photoLink": "string|optional",
  "professionId": "uuid|optional"
}
```

**Request Fields:**
All fields are optional. Only include fields you want to update.
- `name` - User's full name
- `username` - Unique username
- `linkedinUsername` - LinkedIn profile username
- `photoLink` - Profile photo URL
- `professionId` - Selected profession ID

**Response (Success):**
```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "username": "string|null",
    "linkedinUsername": "string|null",
    "photoLink": "string|null",
    "profession": {
      "id": "uuid",
      "name": "string",
      "categoryName": "string"
    } | null
  }
}
```

---

### 3. Get User Profile by ID

**Endpoint:** `GET /api/users/{id}`

**Description:** Retrieves a public view of another user's profile by their ID.

**Headers:**
- No authentication required (public endpoint)

**Path Parameters:**
- `id` - User UUID (required)

**Response (Success):**
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "username": "string|null",
    "linkedinUsername": "string|null",
    "photoLink": "string|null",
    "profession": {
      "name": "string",
      "categoryName": "string"
    } | null
  }
}
```

**Response Fields:**
- `id` - User identifier
- `name` - User's full name
- `username` - User's username
- `linkedinUsername` - LinkedIn profile username
- `photoLink` - Profile photo URL
- `profession` - User's profession details (no ID exposed)

---

### 4. Complete User Registration

**Endpoint:** `POST /api/users/me/complete`

**Description:** Completes the user registration by adding profile details like profession and photo. This is for users who registered via auth but haven't filled out their complete profile yet.

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string",
  "email": "string|null",
  "linkedinUsername": "string|null",
  "photoLink": "string",
  "professionId": "uuid"
}
```

**Request Fields:**
- `name` - User's display name (required)
- `email` - User's email address (optional)
- `linkedinUsername` - LinkedIn profile username (optional)
- `photoLink` - URL to profile photo (required)
- `professionId` - Selected profession from professions table (required)

**Response (Success):**
```json
{
  "message": "Registration completed successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "username": "string|null",
    "linkedinUsername": "string|null",
    "photoLink": "string",
    "profession": {
      "id": "uuid",
      "name": "string",
      "categoryName": "string"
    }
  }
}
```

**Business Logic:**
- For users who have authenticated but haven't completed their profile
- Updates essential fields needed for event participation
- Similar to attendee registration but without event context
- User must be authenticated but can have incomplete profile initially

---

### 5. Get My Event History

**Endpoint:** `GET /api/users/me/events`

**Description:** Retrieves events where the current user is registered as an attendee. This provides the user's event attendance history.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by event status:
  - `upcoming` - Future events only
  - `ongoing` - Currently happening events
  - `completed` - Past events only
  - `all` - All events (default)
- `sortBy` - Field to sort by ('start', 'end', 'created_at')
- `sortOrder` - Sort order ('asc' or 'desc', default: 'desc')

**Example Request:**
```
GET /api/users/me/events?page=1&limit=10&status=upcoming&sortBy=start&sortOrder=asc
```

**Response (Success):**
```json
{
  "message": "Event history retrieved successfully",
  "data": {
    "items": [
      {
        "attendeeId": "uuid",
        "event": {
          "id": "uuid",
          "name": "string",
          "start": "datetime",
          "end": "datetime",
          "detail": "string|null",
          "photo_link": "string|null",
          "location_name": "string|null",
          "location_address": "string|null",
          "location_link": "string|null",
          "link": "string|null",
          "status": "EventStatus",
          "current_participants": "number",
          "code": "string"
        },
        "attendeeInfo": {
          "nickname": "string|null",
          "goalsCategory": {
            "name": "string"
          },
          "profession": {
            "name": "string",
            "categoryName": "string"
          } | null,
          "linkedinUsername": "string|null",
          "photoLink": "string|null"
        },
        "registrationDate": "datetime"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number", 
      "totalItems": "number",
      "itemsPerPage": "number",
      "hasNextPage": "boolean",
      "hasPreviousPage": "boolean"
    }
  }
}
```

**Response Fields:**
- `attendeeId` - User's attendee ID for this event
- `event` - Complete event information
- `attendeeInfo` - User's registration details for this event
- `registrationDate` - When user registered for the event

**Business Logic:**
- Queries through the Attendee table where `user_id` matches current user
- Returns events with user's specific attendee information
- Includes goals category and profession used during registration
- Shows registration timestamp (`created_at` from attendee record)

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "username",
      "message": "Username must be between 1 and 50 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "details": [
    {
      "field": "auth",
      "message": "User not authenticated"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "User not found",
  "details": [
    {
      "field": "id",
      "message": "User with specified id does not exist"
    }
  ]
}
```

### 409 Conflict
```json
{
  "error": "Username already exists",
  "details": [
    {
      "field": "username",
      "message": "This username is already taken"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to retrieve profile",
  "details": [
    {
      "field": "server",
      "message": "An error occurred while retrieving profile"
    }
  ]
}
```

---

## Implementation Notes

### Security Considerations
- Email addresses are only returned in authenticated profile endpoints
- Public profiles exclude sensitive information
- Username uniqueness validation required
- Profile updates require authentication

### Performance Considerations
- Event history includes pagination for large datasets
- Public profile endpoint optimized for minimal data exposure
- Database indexes on user lookup fields
- Profession data is joined efficiently

### Business Rules
- Public profiles show limited information
- Event history shows complete attendee context
- User can update most profile fields except email
- Profession changes affect future event registrations only

### Data Relationships
- Event history retrieved through Attendee table joins
- Profession information included from related tables
- Goals category shown as registered during event attendance
- Registration details preserved per event participation

### Future Enhancements
- Profile photo upload functionality
- Social media link management
- Privacy settings for public profiles
- Event recommendation based on history
- Attendee networking suggestions
- Export event history functionality
