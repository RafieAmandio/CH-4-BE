# CH4 API Contract

## General Information

### Standards
- **API Base URL**: https://api.ch4.com/v1
- **Data Format**: All request and response bodies use JSON format
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- **Character Encoding**: UTF-8
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Authentication**: JWT-based token authentication
- **Error Codes**: Standard HTTP status codes with detailed error messages
- **Documentation Format**: OpenAPI 3.0

### Implementation Details
- All IDs utilize ULID format for better sorting and security
- Authentication is performed using JWT tokens containing userID
- Response formats follow consistent patterns for all endpoints
- Rate limiting of 100 requests per minute per user
- All sensitive data must be transmitted over HTTPS

## Response Formats

### Standard Response Format
```json
{
  "message": "Description of the response",
  "content": {}, // JSON object containing the result data
  "errors": [] // Array of error objects
}
```

### List Response Format
```json
{
  "message": "Description of the response",
  "content": {
    "totalData": 100, // Total number of records
    "totalPage": 10, // Total number of pages
    "entries": [] // Array of data entries
  },
  "errors": [] // Array of error objects
}
```

## Filtering, Pagination, and Searching

For list endpoints, the following query parameters are supported:
- **filters** - Object with string keys and array values for exact matching
- **searchFilters** - Object with string keys and array values for partial matching
- **rangedFilters** - Array of objects with "key", "start", and "end" properties
- **page** - Page number (integer)
- **rows** - Number of records per page (integer)
- **orderKey** - Column name to order by (string)
- **orderRule** - "asc" for ascending, "desc" for descending

### Examples

#### Basic Pagination
```
GET /api/events?page=2&rows=10
```
Returns the second page of events with 10 events per page.

#### Sorting
```
GET /api/events?orderKey=datetime&orderRule=desc
```
Returns events sorted by datetime in descending order (newest first).

#### Exact Filtering
```
GET /api/events?filters={"status":["Active","Upcoming"]}
```
Returns only events with status exactly matching "Active" or "Upcoming".

#### Search Filtering
```
GET /api/events?searchFilters={"name":["conference"]}
```
Returns events with "conference" in their name.

#### Range Filtering
```
GET /api/events?rangedFilters=[{"key":"datetime","start":"2025-01-01T00:00:00Z","end":"2025-12-31T23:59:59Z"}]
```
Returns events starting between January 1st and December 31st, 2025.

#### Combined Filtering and Pagination
```
GET /api/events?filters={"status":["Active"]}&searchFilters={"name":["tech"]}&page=1&rows=20&orderKey=datetime&orderRule=asc
```
Returns the first page (20 items per page) of Active events with "tech" in the name, sorted by datetime in ascending order.

---

## Authentication Endpoints

### Register
- **URL**: `/api/auth/register`
- **Method**: POST
- **Request Body**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "linkedinLink": "https://linkedin.com/in/username", // Optional
  "description": "Brief description about the user" // Optional
}
```

- **Success Response**:
```json
{
  "message": "Registration successful",
  "content": null,
  "errors": []
}
```

- **Error Response**:
```json
{
  "message": "Validation Error",
  "content": null,
  "errors": [
    {
      "field": "email",
      "message": "email already exists"
    },
    {
      "field": "name",
      "message": "name cannot be empty"
    }
  ]
}
```

- **Logic**:
  - Automatically create createdAt and updatedAt fields
  - Password must be hashed
  - Email must be unique

### Login
- **URL**: `/api/auth/login`
- **Method**: POST
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Success Response**:
```json
{
  "message": "Login successful",
  "content": {
    "token": "your_jwt_token_here"
  },
  "errors": []
}
```

- **Error Response**:
```json
{
  "message": "Authentication Error",
  "content": null,
  "errors": [
    {
      "field": "credentials",
      "message": "invalid email or password"
    }
  ]
}
```

- **Logic**:
  - Token expires after 7 days
  - Password must be compared using hash

### Logout
- **URL**: `/api/auth/logout`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Success Response**:
```json
{
  "message": "Logout successful",
  "content": null,
  "errors": []
}
```

---

## User Profile Endpoints

### Get My Profile
- **URL**: `/api/users/me`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Success Response**:
```json
{
  "message": "Profile retrieved successfully",
  "content": {
    "id": "01HJD8Q9PQWERTY123456789",
    "name": "User Name",
    "email": "user@example.com",
    "linkedinLink": "https://linkedin.com/in/username",
    "description": "Brief description about the user",
    "profilePhoto": "https://cdn.ch4.com/photos/user123.jpg",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  },
  "errors": []
}
```

### Update My Profile
- **URL**: `/api/users/me`
- **Method**: PUT
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "name": "Updated Name",
  "linkedinLink": "https://linkedin.com/in/updated",
  "description": "Updated description about the user"
}
```

- **Success Response**:
```json
{
  "message": "Profile updated successfully",
  "content": {
    "id": "01HJD8Q9PQWERTY123456789",
    "name": "Updated Name",
    "email": "user@example.com",
    "linkedinLink": "https://linkedin.com/in/updated",
    "description": "Updated description about the user",
    "profilePhoto": "https://cdn.ch4.com/photos/user123.jpg",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T00:00:00Z"
  },
  "errors": []
}
```

### Get Other User Profile
- **URL**: `/api/users/{id}`
- **Method**: GET
- **URL Parameters**: `id` - User ULID
- **Success Response**:
```json
{
  "message": "User profile retrieved successfully",
  "content": {
    "id": "01HJD8Q9PQWERTY987654321",
    "name": "Other User Name",
    "linkedinLink": "https://linkedin.com/in/otheruser",
    "description": "Brief description about the other user",
    "profilePhoto": "https://cdn.ch4.com/photos/user456.jpg"
  },
  "errors": []
}
```

- **Error Response**:
```json
{
  "message": "User not found",
  "content": null,
  "errors": [
    {
      "field": "id",
      "message": "user with specified id does not exist"
    }
  ]
}
```

### Upload Profile Photo
- **URL**: `/api/users/me/photo`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**: Multipart form data with photo file
- **Success Response**:
```json
{
  "message": "Photo uploaded successfully",
  "content": {
    "profilePhoto": "https://cdn.ch4.com/photos/user123.jpg"
  },
  "errors": []
}
```

---

## Event CRUD Endpoints

### List Events
- **URL**: `/api/events`
- **Method**: GET
- **Query Parameters**: Standard filtering parameters
- **Success Response**:
```json
{
  "message": "Events retrieved successfully",
  "content": {
    "totalData": 50,
    "totalPage": 5,
    "entries": [
      {
        "id": "01HJD8Q9PQWERTY123456789",
        "name": "Tech Conference 2025",
        "datetime": "2025-03-15T09:00:00Z",
        "description": "Annual technology conference for networking",
        "location": "Jakarta Convention Center",
        "status": "Upcoming",
        "maxParticipants": 500,
        "currentParticipants": 125,
        "creatorId": "01HJD8Q9PQWERTY987654321",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ]
  },
  "errors": []
}
```

### Get Event Details
- **URL**: `/api/events/{id}`
- **Method**: GET
- **URL Parameters**: `id` - Event ULID
- **Success Response**:
```json
{
  "message": "Event details retrieved successfully",
  "content": {
    "id": "01HJD8Q9PQWERTY123456789",
    "name": "Tech Conference 2025",
    "datetime": "2025-03-15T09:00:00Z",
    "description": "Annual technology conference for networking professionals. Join us for keynote speakers, workshops, and networking opportunities.",
    "location": "Jakarta Convention Center, Hall A",
    "status": "Upcoming",
    "maxParticipants": 500,
    "currentParticipants": 125,
    "creatorId": "01HJD8Q9PQWERTY987654321",
    "creatorName": "Event Organizer",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  },
  "errors": []
}
```

### Create Event
- **URL**: `/api/events`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "name": "Tech Conference 2025",
  "datetime": "2025-03-15T09:00:00Z",
  "description": "Annual technology conference for networking",
  "location": "Jakarta Convention Center",
  "maxParticipants": 500
}
```

- **Success Response**:
```json
{
  "message": "Event created successfully",
  "content": {
    "id": "01HJD8Q9PQWERTY123456789",
    "name": "Tech Conference 2025",
    "datetime": "2025-03-15T09:00:00Z",
    "description": "Annual technology conference for networking",
    "location": "Jakarta Convention Center",
    "status": "Upcoming",
    "maxParticipants": 500,
    "currentParticipants": 0,
    "creatorId": "01HJD8Q9PQWERTY987654321",
    "qrCode": "01HJD8Q9PQWERTY123456789",
    "createdAt": "2025-01-15T00:00:00Z",
    "updatedAt": "2025-01-15T00:00:00Z"
  },
  "errors": []
}
```

### Update Event
- **URL**: `/api/events/{id}`
- **Method**: PUT
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id` - Event ULID
- **Request Body**:
```json
{
  "name": "Updated Tech Conference 2025",
  "datetime": "2025-03-16T09:00:00Z",
  "description": "Updated description",
  "location": "Updated location",
  "maxParticipants": 600
}
```

- **Success Response**: Same as Create Event
- **Error Response** (if not creator):
```json
{
  "message": "Authorization Error",
  "content": null,
  "errors": [
    {
      "field": "permission",
      "message": "only event creator can update this event"
    }
  ]
}
```

### Delete Event
- **URL**: `/api/events/{id}`
- **Method**: DELETE
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id` - Event ULID
- **Success Response**:
```json
{
  "message": "Event deleted successfully",
  "content": null,
  "errors": []
}
```

---

## Event Participation Endpoints

### Join Event
- **URL**: `/api/events/join`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "eventId": "01HJD8Q9PQWERTY123456789",
  "name": "Participant Name",
  "linkedinLink": "https://linkedin.com/in/participant",
  "description": "Brief description about the participant"
}
```

- **Success Response**:
```json
{
  "message": "Successfully joined event",
  "content": {
    "id": "01HJD8Q9PQWERTY555666777",
    "userId": "01HJD8Q9PQWERTY987654321",
    "eventId": "01HJD8Q9PQWERTY123456789",
    "participantName": "Participant Name",
    "participantLinkedin": "https://linkedin.com/in/participant",
    "participantDescription": "Brief description about the participant",
    "joinedAt": "2025-01-15T10:30:00Z"
  },
  "errors": []
}
```

- **Error Response**:
```json
{
  "message": "Event Full",
  "content": null,
  "errors": [
    {
      "field": "eventId",
      "message": "event has reached maximum participants"
    }
  ]
}
```

### Get Current Active Event
- **URL**: `/api/events/current`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Success Response**:
```json
{
  "message": "Current event retrieved successfully",
  "content": {
    "id": "01HJD8Q9PQWERTY123456789",
    "name": "Tech Conference 2025",
    "datetime": "2025-03-15T09:00:00Z",
    "description": "Annual technology conference for networking",
    "location": "Jakarta Convention Center",
    "status": "Active",
    "maxParticipants": 500,
    "currentParticipants": 125,
    "creatorId": "01HJD8Q9PQWERTY987654321",
    "joinedAt": "2025-03-15T08:30:00Z"
  },
  "errors": []
}
```

- **No Current Event Response**:
```json
{
  "message": "No current active event",
  "content": null,
  "errors": []
}
```

### Get My Event History
- **URL**: `/api/events/me`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**: Standard filtering parameters
- **Success Response**:
```json
{
  "message": "User events retrieved successfully",
  "content": {
    "totalData": 15,
    "totalPage": 2,
    "entries": [
      {
        "id": "01HJD8Q9PQWERTY123456789",
        "name": "Tech Conference 2025",
        "datetime": "2025-03-15T09:00:00Z",
        "description": "Annual technology conference",
        "location": "Jakarta Convention Center",
        "status": "Completed",
        "joinedAt": "2025-03-15T08:30:00Z"
      }
    ]
  },
  "errors": []
}
```

### Get Event Attendees
- **URL**: `/api/events/{id}/attendees`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id` - Event ULID
- **Query Parameters**: Standard filtering parameters
- **Success Response**:
```json
{
  "message": "Event attendees retrieved successfully",
  "content": {
    "totalData": 125,
    "totalPage": 13,
    "entries": [
      {
        "id": "01HJD8Q9PQWERTY987654321",
        "name": "Attendee Name",
        "linkedinLink": "https://linkedin.com/in/attendee",
        "description": "Software engineer with 5 years experience",
        "profilePhoto": "https://cdn.ch4.com/photos/attendee123.jpg",
        "joinedAt": "2025-03-15T08:30:00Z"
      }
    ]
  },
  "errors": []
}
```

### Leave Event
- **URL**: `/api/events/{id}/leave`
- **Method**: DELETE
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id` - Event ULID
- **Success Response**:
```json
{
  "message": "Successfully left event",
  "content": null,
  "errors": []
}
```

---

## Networking Endpoints

### Get Event Recommendations
- **URL**: `/api/events/{id}/recommendations`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id` - Event ULID
- **Success Response**:
```json
{
  "message": "Recommendations retrieved successfully",
  "content": [
    {
      "id": "01HJD8Q9PQWERTY111222333",
      "name": "Recommended Person 1",
      "linkedinLink": "https://linkedin.com/in/person1",
      "description": "Product manager interested in AI and machine learning",
      "profilePhoto": "https://cdn.ch4.com/photos/person1.jpg",
      "matchReason": "Similar interests in technology and AI"
    },
    {
      "id": "01HJD8Q9PQWERTY444555666",
      "name": "Recommended Person 2",
      "linkedinLink": "https://linkedin.com/in/person2",
      "description": "Startup founder in fintech space",
      "profilePhoto": "https://cdn.ch4.com/photos/person2.jpg",
      "matchReason": "Both interested in fintech and entrepreneurship"
    }
  ],
  "errors": []
}
```

---

## Creator Endpoints

### Get My Created Events
- **URL**: `/api/events/created`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**: Standard filtering parameters
- **Success Response**:
```json
{
  "message": "Created events retrieved successfully",
  "content": {
    "totalData": 8,
    "totalPage": 1,
    "entries": [
      {
        "id": "01HJD8Q9PQWERTY123456789",
        "name": "Tech Conference 2025",
        "datetime": "2025-03-15T09:00:00Z",
        "description": "Annual technology conference",
        "location": "Jakarta Convention Center",
        "status": "Upcoming",
        "maxParticipants": 500,
        "currentParticipants": 125,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ]
  },
  "errors": []
}
```

### Get Event QR Code
- **URL**: `/api/events/{id}/qr-code`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **URL Parameters**: `id` - Event ULID
- **Success Response**:
```json
{
  "message": "QR code retrieved successfully",
  "content": {
    "qrCode": "01HJD8Q9PQWERTY123456789",
    "qrCodeUrl": "https://api.ch4.com/join/01HJD8Q9PQWERTY123456789",
    "qrCodeImage": "https://cdn.ch4.com/qr/01HJD8Q9PQWERTY123456789.png"
  },
  "errors": []
}
```

- **Error Response** (if not creator):
```json
{
  "message": "Authorization Error",
  "content": null,
  "errors": [
    {
      "field": "permission",
      "message": "only event creator can access QR code"
    }
  ]
}
```

---

## Database Schema (Referenced)

```sql
Table users {
  id ulid [pk]
  name varchar
  email varchar [unique]
  password varchar
  linkedinLink varchar
  description text
  profilePhoto varchar
  createdAt timestamp
  updatedAt timestamp
}

Table events {
  id ulid [pk]
  name varchar
  datetime timestamp
  description text
  location varchar
  status varchar // "Upcoming", "Active", "Completed", "Cancelled"
  maxParticipants integer
  currentParticipants integer [default: 0]
  creatorId ulid [ref: > users.id]
  qrCode varchar [unique]
  createdAt timestamp
  updatedAt timestamp
}

Table eventParticipants {
  id ulid [pk]
  userId ulid [ref: > users.id]
  eventId ulid [ref: > events.id]
  participantName varchar
  participantLinkedin varchar
  participantDescription text
  joinedAt timestamp
}
```

## Logic Notes

- **Event Status**: Automatically updated based on datetime (Upcoming → Active → Completed)
- **Current Event**: Only one "Active" event per user at a time
- **QR Code**: Generated automatically when event is created, contains event ID
- **Recommendations**: Algorithm based on participant descriptions, LinkedIn profiles, and common interests
- **Authentication**: JWT tokens expire after 7 days
- **File Upload**: Profile photos stored in CDN, returns public URL