# Attendee API Contract

## Overview

This document outlines the API contract for attendee management, which includes registration, onboarding, and recommendation functionality.

## Flow

1. **Validate Event** - Validate event by code for registration
2. **Get Professions** - Fetch available professions by category
3. **Create Attendee** - Register for event (authenticated or visitor)
4. **Get Goals Categories** - Fetch available goal categories
5. **Update Attendee with Goals Category** - Choose a category and receive associated questions
6. **Submit Answers** - Provide responses to the questionnaire
7. **Get Recommendations** - Fetch AI-generated networking recommendations

---

## Endpoints

### 1. Validate Event

**Endpoint:** `GET /api/attendee/validate-event/{code}`

**Description:** Validates an event by its unique code and returns event details if it's active and available for registration. This endpoint is used after QR code scanning.

**Headers:**
- No authentication required (public endpoint)

**Path Parameters:**
- `code` - Event code (6-digit string) (required)

**Response (Success - Active Event):**
```json
{
  "message": "Event validated successfully",
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
    "status": "UPCOMING|ONGOING",
    "current_participants": "number",
    "code": "string",
    "creator": {
      "id": "uuid",
      "name": "string"
    },
    "isAlreadyIn": "boolean|null"
  }
}
```

**Response (Event Not Found or Inactive):**
```json
{
  "error": "Event not found",
  "details": [
    {
      "field": "code",
      "message": "Event with this code does not exist"
    }
  ]
}
```

**Response (Already Registered - 409 Conflict):**
```json
{
  "success": false,
  "message": "Already registered for this event",
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
    "status": "UPCOMING|ONGOING",
    "current_participants": "number",
    "code": "string",
    "creator": {
      "id": "uuid",
      "name": "string"
    },
    "isAlreadyIn": true
  },
  "errors": [
    {
      "field": "registration",
      "message": "You are already registered for this event"
    }
  ]
}
```

**Business Logic:**
- Validates event exists by code
- Only returns events with status `UPCOMING` or `ONGOING`
- Excludes `DRAFT` and `COMPLETED` events
- Only returns active events (`is_active: true`)
- Public endpoint - no authentication required
- Creator email is excluded from public response
- If user is authenticated, checks if they are already registered for the event
- `isAlreadyIn` field indicates whether the authenticated user is already an attendee (null for unauthenticated users)
- If user is already registered, returns 409 Conflict with event details and error message
- Client can use the event details from the error response to display event information

---

### 2. Get Professions

**Endpoint:** `GET /api/attendee/professions`

**Description:** Returns all active professions grouped by category. This is a public endpoint that doesn't require authentication.

**Headers:**
- No authentication required

**Response:**
```json
{
  "message": "Professions retrieved successfully",
  "data": [
    {
      "categoryId": "uuid",
      "categoryName": "string",
      "professions": [
        {
          "id": "uuid",
          "name": "string"
        }
      ]
    }
  ]
}
```

**Response Fields:**
- `categoryId` - Profession category identifier
- `categoryName` - Category display name
- `professions` - Array of professions in this category
  - `id` - Profession identifier
  - `name` - Profession display name

---

### 3. Create Attendee

**Endpoint:** `POST /api/attendee/register`

**Description:** Registers a new attendee for an event. Supports both authenticated users and visitors. For visitors, generates a temporary access token.

**Headers:**
- `Authorization: Bearer <token>` (optional - for authenticated users)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "eventCode": "string",
  "nickname": "string",
  "userEmail": "string|null", 
  "professionId": "uuid",
  "linkedinUsername": "string|null",
  "photoLink": "string"
}
```

**Request Fields:**
- `eventCode` - Event code (6-digit string) (required)
- `nickname` - Attendee's display name (required) - can be real name or preferred name
- `userEmail` - Attendee's email address (optional)
- `professionId` - Selected profession from professions table (required)
- `linkedinUsername` - LinkedIn profile username (optional)
- `photoLink` - URL to profile photo (required)

**Response (Success):**
```json
{
  "message": "Attendee registered successfully",
  "data": {
    "attendeeId": "uuid",
    "accessToken": "jwt_token"
  }
}
```

**Response Fields:**
- `attendeeId` - Created attendee identifier
- `accessToken` - JWT token (for both users and visitors)

**Business Logic:**
- If valid `Authorization` header with user token:
  - Create attendee with `user_id` populated
  - Return enhanced user token with `attendeeId` embedded
- If no valid token (visitor):
  - Create attendee without `user_id` 
  - Generate visitor token with `attendeeId` as the primary identifier
  - Return `attendeeId` and visitor `accessToken`

---

### 4. Get Goals Categories

**Endpoint:** `GET /api/attendee/goals-categories`

**Description:** Returns all active goals categories available for selection. Requires attendee authentication.

**Headers:**
- `Authorization: Bearer <attendee_token>` (required - attendee token only)

**Response:**
```json
{
  "message": "Goals categories retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "string"
    }
  ]
}
```

**Response Fields:**
- `id` - Unique identifier for the goals category
- `name` - Display name of the goals category

**Authentication:**
- Requires attendee token (visitor or user-based)
- `attendeeId` is extracted from the token automatically

---

### 5. Update Attendee with Goals Category

**Endpoint:** `PUT /api/attendee/goals-category`

**Description:** Updates the attendee's goals category selection and returns all questions for that category, ordered by display_order. The attendeeId is automatically extracted from the token.

**Headers:**
- `Authorization: Bearer <attendee_token>` (required - attendee token only)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "goalsCategoryId": "uuid"
}
```

**Request Fields:**
- `goalsCategoryId` - Selected goals category ID (required)

**Response:**
```json
{
  "message": "Goals category updated successfully",
  "data": {
    "attendeeId": "uuid",
    "goalsCategory": {
      "id": "uuid",
      "name": "string"
    },
    "questions": [
      {
        "id": "uuid",
        "question": "string",
        "type": "QuestionType",
        "placeholder": "string|null",
        "displayOrder": "number",
        "isRequired": "boolean",
        "isShareable": "boolean",
        "constraints": {
          "minSelect": "number",
          "maxSelect": "number|null",
          "requireRanking": "boolean",
          "isUsingOther": "boolean",
          "textMaxLen": "number|null",
          "numberMin": "decimal|null",
          "numberMax": "decimal|null",
          "numberStep": "decimal|null"
        },
        "answerOptions": [
          {
            "id": "uuid",
            "label": "string",
            "value": "string|null",
            "displayOrder": "number"
          }
        ]
      }
    ]
  }
}
```

**Response Fields:**
- `attendeeId` - Attendee identifier (from token)
- `goalsCategory` - Selected goals category information
- `questions` - Array of questions ordered by display_order

**Authentication:**
- Requires attendee token (visitor or user-based)
- `attendeeId` is extracted from the token automatically
- No need to pass attendeeId in URL or body

---

### 6. Submit User Answers

**Endpoint:** `POST /api/attendee/answers`

**Description:** Submits answers for questionnaire completion. The attendeeId is automatically extracted from the token.

**Headers:**
- `Authorization: Bearer <attendee_token>` (required - attendee token only)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answerOptionId": "uuid|null",
      "textValue": "string|null",
      "numberValue": "decimal|null", 
      "dateValue": "datetime|null",
      "rank": "number|null",
      "weight": "decimal|null"
    }
  ]
}
```

**Request Fields:**
- `answers` - Array of answer objects (required)

**Answer Object:**
- `questionId` - Question being answered (required)
- `answerOptionId` - Selected option ID (optional, depends on question type)
- `textValue` - Text response (optional, depends on question type)
- `numberValue` - Numeric response (optional, depends on question type)
- `dateValue` - Date response (optional, depends on question type)
- `rank` - Ranking value (optional, depends on question type)
- `weight` - Weighting value (optional, depends on question type)

**Response:**
```json
{
  "message": "Answers submitted successfully",
  "data": {
    "answersProcessed": "number",
    "recommendations": [
      {
        "targetAttendeeId": "uuid",
        "reasoning": "string",
        "targetAttendee": {
          "nickname": "string",
          "profession": {
            "name": "string",
            "categoryName": "string"
          },
          "goalsCategory": {
            "name": "string"
          },
          "linkedinUsername": "string|null",
          "photoLink": "string",
          "shareableAnswers": [
            {
              "question": "string",
              "questionType": "QuestionType",
              "answerLabel": "string|null",
              "textValue": "string|null",
              "numberValue": "decimal|null",
              "dateValue": "datetime|null",
              "rank": "number|null"
            }
          ]
        }
      }
    ]
  }
}
```

**Response Fields:**
- `answersProcessed` - Number of answers successfully processed
- `recommendations` - Array of top 3 AI-generated recommendations (without scores)

**Authentication:**
- Requires attendee token (visitor or user-based)
- `attendeeId` is extracted from the token automatically
- No need to pass attendeeId in body

---

### 7. Get Recommendations

**Endpoint:** `GET /api/attendee/recommendations`

**Description:** Retrieves AI-generated networking recommendations for the authenticated attendee. This endpoint triggers the AI recommendation service to generate fresh recommendations based on all attendees in the same event. The attendeeId is automatically extracted from the token.

**Headers:**
- `Authorization: Bearer <attendee_token>` (required - attendee token only)

**Response:**
```json
{
  "message": "Recommendations retrieved successfully",
  "data": {
    "attendeeId": "uuid",
    "eventId": "uuid", 
    "recommendations": [
      {
        "targetAttendeeId": "uuid",
        "score": "decimal",
        "reasoning": "string",
        "targetAttendee": {
          "nickname": "string",
          "profession": {
            "name": "string",
            "categoryName": "string"
          },
          "goalsCategory": {
            "name": "string"
          },
          "linkedinUsername": "string|null",
          "photoLink": "string",
          "shareableAnswers": [
            {
              "question": "string",
              "questionType": "QuestionType",
              "answerLabel": "string|null",
              "textValue": "string|null",
              "numberValue": "decimal|null",
              "dateValue": "datetime|null",
              "rank": "number|null"
            }
          ]
        }
      }
    ]
  }
}
```

**Response Fields:**
- `attendeeId` - Requesting attendee's ID (from token)
- `eventId` - Event identifier
- `recommendations` - Array of recommendation objects

**Recommendation Object:**
- `targetAttendeeId` - Recommended attendee's ID
- `score` - Compatibility score (0-1, up to 4 decimal places)
- `reasoning` - AI-generated explanation for the match
- `targetAttendee` - Complete attendee profile

**Authentication:**
- Requires attendee token (visitor or user-based)
- `attendeeId` is extracted from the token automatically
- No need to pass attendeeId in URL

**Business Logic:**
1. Extract attendeeId from token
2. Always call AI service endpoint `/ai/attendees/recommendations` with current attendee data
3. If AI service returns recommendations:
   - Deactivate previous stored recommendations
   - Store new recommendations in database
   - Return fresh recommendations with scores
4. If AI service is unavailable:
   - Fallback to stored recommendations from database
   - Return stored recommendations with scores

---

## Token-Based Authentication System

### Token Types

**1. User Token (Enhanced)**
- Contains user information + `attendeeId` when registered for an event
- Used for authenticated users who have registered for an event
- Structure: `{ id: userId, email: userEmail, attendeeId: attendeeId }`

**2. Visitor Token**
- Contains only attendee information for anonymous users
- Used for visitors who register without a user account
- Structure: `{ attendeeId: attendeeId }` (no email field)

### Authentication Flow

**For User Tokens:**
1. Check if token contains `email` field (indicates user token)
2. Validate user exists in database
3. Extract `attendeeId` from token
4. Verify attendee belongs to the user (if `attendeeId` present)

**For Visitor Tokens:**
1. Check if token lacks `email` field (indicates visitor token)
2. Extract `attendeeId` from token
3. Validate attendee exists and is active

### Endpoint Authentication Requirements

| Endpoint | Auth Required | Token Type | attendeeId Source |
|----------|--------------|------------|------------------|
| `GET /professions` | No | - | - |
| `GET /validate-event/:code` | No | - | - |
| `POST /register` | Optional | User/None | Generated |
| `GET /goals-categories` | Yes | Attendee | Token |
| `PUT /goals-category` | Yes | Attendee | Token |
| `POST /answers` | Yes | Attendee | Token |
| `GET /recommendations` | Yes | Attendee | Token |

---

## Question Types

| Type | Description | Required Fields | Optional Fields |
|------|-------------|----------------|-----------------|
| `SINGLE_CHOICE` | Single selection from options | `answerOptionId` | `weight` |
| `MULTI_SELECT` | Multiple selections from options | `answerOptionId` | `weight` |
| `RANKED_CHOICE` | Ranked selections from options | `answerOptionId`, `rank` | `weight` |
| `FREE_TEXT` | Text input | `textValue` | - |
| `NUMBER` | Numeric input | `numberValue` | - |
| `SCALE` | Scale/rating input | `numberValue` | `weight` |
| `DATE` | Date selection | `dateValue` | - |

**Note:** Only `questionId` is always required. All other fields are optional and should be provided based on the question type requirements above.

---

## Validation Rules

### General Rules
- Valid attendee token must be provided for all authenticated endpoints
- All required questions must have answers
- Attendee must have a goals category selected before submitting answers

### Type-Specific Rules
- **SINGLE_CHOICE**: Exactly one `answerOptionId` required
- **MULTI_SELECT**: Respect `minSelect` and `maxSelect` constraints
- **RANKED_CHOICE**: Unique rank values required if `requireRanking` is true
- **FREE_TEXT**: Text length must not exceed `textMaxLen`
- **NUMBER/SCALE**: Value must be within `numberMin` and `numberMax` range
- **DATE**: Valid date format required

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "eventCode",
      "message": "Event code must be exactly 6 characters"
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
      "message": "No valid attendee authentication found"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "details": [
    {
      "field": "attendee",
      "message": "Attendee token not allowed for this endpoint"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Attendee not found",
  "details": [
    {
      "field": "attendee",
      "message": "Attendee not found or inactive"
    }
  ]
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Already registered for this event",
  "data": {
    // Event details included in error response
  },
  "errors": [
    {
      "field": "registration",
      "message": "You are already registered for this event"
    }
  ]
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Answer validation failed",
  "details": [
    {
      "field": "questionId",
      "message": "Question not in attendee's goals category"
    }
  ]
}
```

---

## Implementation Notes

### Security Considerations
- For attendee registration: Support both authenticated and anonymous users
- For visitors: Generate secure temporary tokens with attendee scope only
- Verify token authenticity and extract attendeeId automatically
- Validate all foreign key relationships
- Use database transactions for multi-answer submissions
- Visitor tokens should be tied to specific attendee/event combinations

### Performance Considerations  
- Consider caching goals categories (relatively static data)
- Batch answer submissions to reduce database calls
- Index on frequently queried fields (attendee_id, question_id)
- AI service calls are optimized with parallel processing

### Token Management
- User tokens are enhanced with `attendeeId` after event registration
- Visitor tokens contain only attendee information
- Authentication middleware automatically determines token type
- All attendee-specific endpoints extract `attendeeId` from token

### AI Integration
- Submit answers endpoint triggers both training and recommendation calls
- Get recommendations endpoint always calls AI service first
- Fallback to stored recommendations if AI service unavailable
- Recommendations are stored for caching and fallback purposes

### Future Enhancements
- Add progress tracking to attendee model
- Support partial answer submissions (draft mode)
- Add question branching/conditional logic
- Include question help text or descriptions
- Add recommendation expiration and refresh logic
