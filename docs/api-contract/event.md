# Event API Contract

## Overview

This document outlines the API contract for event management, which includes creating, retrieving, updating, and deleting events. All endpoints require authentication.

## Base URL

All event endpoints use the base path: `/api/events`

---

## Endpoints

### 1. Create Event

**Endpoint:** `POST /api/events`

**Description:** Creates a new event. Only authenticated users can create events.

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string",
  "start": "string (ISO 8601)",
  "end": "string (ISO 8601)",
  "description": "string|null",
  "photoLink": "string|null",
  "locationName": "string|null",
  "locationAddress": "string|null",
  "locationLink": "string|null",
  "latitude": "decimal|null",
  "longitude": "decimal|null",
  "link": "string|null"
}
```

**Request Fields:**
- `name` - Event name (required)
- `start` - Event start date and time in ISO 8601 format (required)
- `end` - Event end date and time in ISO 8601 format (required)
- `description` - Event description (optional)
- `photoLink` - URL to event photo/banner (optional)
- `locationName` - Event venue/location name (optional)
- `locationAddress` - Full address of the location (optional)
- `locationLink` - URL link to location (e.g., Google Maps) (optional)
- `latitude` - Location latitude coordinate (optional)
- `longitude` - Location longitude coordinate (optional)
- `link` - Event-related link (e.g., registration, website) (optional)

**Response (Success):**
```json
{
  "message": "Event created successfully",
  "data": {
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
      "latitude": "decimal|null",
      "longitude": "decimal|null",
      "link": "string|null",
      "status": "UPCOMING",
      "current_participants": 0,
      "code": "string",
      "created_by": "uuid"
    }
  }
}
```

**Business Logic:**
- Both start and end times must be provided
- End time must be after start time
- Event status is set to `UPCOMING` by default
- Unique 6-digit event code is auto-generated
- Current participants count starts at 0

---

### 2. Get All Events

**Endpoint:** `GET /api/events`

**Description:** Retrieves all active events with pagination, search, and sorting capabilities.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term (searches in name, description, location name)
- `sortBy` - Field to sort by (e.g., 'name', 'start', 'end', 'created_at')
- `sortOrder` - Sort order ('asc' or 'desc', default: 'desc')
- `filter` - Filter events:
  - `created` - Only events created by the current user (default)
  - `all` - All active events (admin/browsing purposes)

**Example Requests:**
```
GET /api/events?page=1&limit=10&filter=created
GET /api/events?search=conference&filter=all&sortBy=start&sortOrder=asc
```

**Response (Success):**
```json
{
  "message": "Events retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "start": "datetime",
        "end": "datetime", 
        "detail": "string|null",
        "photo_link": "string|null",
        "location_name": "string|null",
        "location_address": "string|null",
        "location_link": "string|null",
        "latitude": "decimal|null",
        "longitude": "decimal|null",
        "link": "string|null",
        "status": "EventStatus",
        "current_participants": "number",
        "code": "string",
        "creator": {
          "id": "uuid",
          "name": "string",
          "username": "string|null",
          "email": "string"
        }
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

---

### 3. Get Event by ID

**Endpoint:** `GET /api/events/{id}`

**Description:** Retrieves a single event by its ID.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `id` - Event UUID (required)

**Response (Success):**
```json
{
  "message": "Event details retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "start": "datetime",
    "end": "datetime",
    "detail": "string|null",
    "photo_link": "string|null",
    "location_name": "string|null",
    "location_address": "string|null",
    "location_link": "string|null",
    "latitude": "decimal|null",
    "longitude": "decimal|null",
    "link": "string|null",
    "status": "EventStatus",
    "current_participants": "number",
    "code": "string",
    "creator": {
      "id": "uuid",
      "name": "string",
      "username": "string|null",
      "email": "string"
    }
  }
}
```

---

### 4. Update Event

**Endpoint:** `PUT /api/events/{id}`

**Description:** Updates an existing event. Only the event creator can update their events.

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Path Parameters:**
- `id` - Event UUID (required)

**Request Body:**
```json
{
  "name": "string|optional",
  "start": "string (ISO 8601)|optional",
  "end": "string (ISO 8601)|optional",
  "description": "string|optional",
  "photoLink": "string|optional",
  "locationName": "string|optional",
  "locationAddress": "string|optional",
  "locationLink": "string|optional",
  "latitude": "decimal|optional",
  "longitude": "decimal|optional",
  "link": "string|optional"
}
```

**Request Fields:**
All fields are optional. Only include fields you want to update.
- `name` - Event name
- `start` - Event start date and time in ISO 8601 format
- `end` - Event end date and time in ISO 8601 format
- `description` - Event description
- `photoLink` - URL to event photo/banner
- `locationName` - Event venue/location name
- `locationAddress` - Full address of the location
- `locationLink` - URL link to location (e.g., Google Maps)
- `latitude` - Location latitude coordinate
- `longitude` - Location longitude coordinate
- `link` - Event-related link (e.g., registration, website)

**Response (Success):**
```json
{
  "message": "Event updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "start": "datetime",
    "end": "datetime",
    "detail": "string|null",
    "photo_link": "string|null",
    "location_name": "string|null",
    "location_address": "string|null",
    "location_link": "string|null",
    "latitude": "decimal|null",
    "longitude": "decimal|null",
    "link": "string|null",
    "status": "EventStatus",
    "current_participants": "number",
    "code": "string",
    "creator": {
      "id": "uuid",
      "name": "string",
      "username": "string|null",
      "email": "string"
    }
  }
}
```

**Business Logic:**
- Only event creator can update the event
- If start or end time is updated, both should be validated
- End time must be after start time
- Partial updates are supported (only send fields to change)

---

### 5. Delete Event

**Endpoint:** `DELETE /api/events/{id}`

**Description:** Soft deletes an event by setting `is_active` to false. Only the event creator can delete their events.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `id` - Event UUID (required)

**Query Parameters:**
- `hard_delete` - Set to `true` for permanent deletion, otherwise soft delete (default: false)

**Response (Success):**
```json
{
  "message": "Event deleted successfully",
  "data": null
}
```

**Business Logic:**
- Only event creator can delete the event
- Performs soft delete (sets `is_active` to false) by default
- Hard delete option available via query parameter
- Event data is preserved but hidden from queries (soft delete)

---

## Event Status Enum

| Status | Description |
|--------|-------------|
| `DRAFT` | Event is being prepared |
| `UPCOMING` | Event is scheduled for the future |
| `ONGOING` | Event is currently happening |
| `COMPLETED` | Event has finished |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Event name is required"
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

### 403 Forbidden
```json
{
  "error": "Authorization Error",
  "details": [
    {
      "field": "permission",
      "message": "only event creator can update this event"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Event not found",
  "details": [
    {
      "field": "id",
      "message": "Event with specified ID does not exist"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Create event failed",
  "details": [
    {
      "field": "server",
      "message": "An error occurred while creating the event"
    }
  ]
}
```

---

## Implementation Notes

### Security Considerations
- All endpoints require authentication
- Update and delete operations require event ownership verification
- Input validation and sanitization on all fields
- Soft delete preserves data integrity

### Performance Considerations
- Pagination is enforced on list endpoints
- Database indexes on frequently queried fields
- Search functionality uses case-insensitive matching
- Default filter shows only user's created events for better performance
- Only active events are returned in queries

### Business Rules
- Both start and end times must be provided when creating events
- End time must be after start time
- Unique event codes are auto-generated for each event
- Events use soft delete for data preservation
- Search functionality covers name, description, and location name fields

### Future Enhancements
- Event capacity limits
- RSVP functionality
- Event categories/tags
- Recurring events
- Event photo uploads
- Advanced location features (address geocoding)
- **Attendee Event History**: Separate endpoint for events where user is registered as attendee
