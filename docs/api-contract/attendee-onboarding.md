# Attendee Onboarding API Contract

## Overview

This document outlines the API contract for the attendee onboarding process, which consists of three main endpoints to guide users through goal selection and questionnaire completion.

## Flow

1. **Get Professions** - Fetch available professions by category
2. **Create Attendee** - Register for event (authenticated or visitor)
3. **Get Goals Categories** - Fetch available goal categories
4. **Select Goal Category** - Choose a category and receive associated questions
5. **Submit Answers** - Provide responses to the questionnaire

---

## Endpoints

### 1. Get Professions

**Endpoint:** `GET /api/attendee/onboarding/professions`

**Description:** Returns all active professions grouped by category. This is a public endpoint that doesn't require authentication.

**Headers:**
- No authentication required

**Response:**
```json
{
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

### 2. Create Attendee

**Endpoint:** `POST /api/attendee/onboarding/register`

**Description:** Registers a new attendee for an event. Supports both authenticated users and visitors. For visitors, generates a temporary access token.

**Headers:**
- `Authorization: Bearer <token>` (optional - for authenticated users)

**Request Body:**
```json
{
  "eventId": "uuid",
  "userName": "string",
  "userEmail": "string", 
  "nickname": "string|null",
  "professionId": "uuid|null",
  "linkedinUsername": "string|null",
  "photoLink": "string|null"
}
```

**Request Fields:**
- `eventId` - Event identifier (required)
- `userName` - Attendee's display name (required)
- `userEmail` - Attendee's email address (required)
- `nickname` - Optional nickname/preferred name
- `professionId` - Selected profession from professions table
- `linkedinUsername` - LinkedIn profile username
- `photoLink` - URL to profile photo

**Response (Authenticated User):**
```json
{
  "message": "Attendee registered successfully",
  "data": {
    "attendeeId": "uuid"
  }
}
```

**Response (Visitor/Guest):**
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
- `accessToken` - Temporary JWT token (only for visitors)

**Business Logic:**
- If valid `Authorization` header with user token:
  - Create attendee with `user_id` populated
  - Return only `attendeeId`
- If no valid token (visitor):
  - Create attendee without `user_id` 
  - Generate temporary access token for subsequent API calls
  - Return `attendeeId` and `accessToken`

---

### 3. Get Goals Categories

**Endpoint:** `GET /api/attendee/onboarding/goals-categories`

**Endpoint:** `GET /api/attendee/onboarding/goals-categories`

**Description:** Returns all active goals categories available for selection.

**Response:**
```json
{
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

---

### 4. Get Questions by Goals Category

**Endpoint:** `POST /api/attendee/onboarding/goals-categories/{categoryId}/questions`

**Description:** Returns all questions for the selected goals category, ordered by display_order.

**Path Parameters:**
- `categoryId` - UUID of the selected goals category

**Response:**
```json
{
  "data": {
    "questions": [
      {
        "id": "uuid",
        "question": "string",
        "type": "QuestionType",
        "displayOrder": "number",
        "isRequired": "boolean",
        "constraints": {
          "minSelect": "number",
          "maxSelect": "number|null",
          "requireRanking": "boolean",
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

**Question Object:**
- `id` - Question identifier
- `question` - Question text
- `type` - Question type enum (see [Question Types](#question-types))
- `displayOrder` - Order for display
- `isRequired` - Whether question must be answered
- `constraints` - Type-specific constraints
- `answerOptions` - Available options (for selection-based questions)

**Constraints Object (conditional based on question type):**
- `minSelect` - Minimum selections required
- `maxSelect` - Maximum selections allowed
- `requireRanking` - Whether ranking is required
- `textMaxLen` - Maximum text length
- `numberMin` - Minimum numeric value
- `numberMax` - Maximum numeric value  
- `numberStep` - Numeric step increment

**Answer Option Object:**
- `id` - Option identifier
- `label` - Display text
- `value` - Optional underlying value
- `displayOrder` - Display order

---

### 5. Submit User Answers

**Endpoint:** `POST /api/attendee/onboarding/answers`

**Description:** Submits answers for questionnaire completion.

**Request Body:**
```json
{
  "attendeeId": "uuid",
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
- `attendeeId` - ID of the attendee submitting answers
- `answers` - Array of answer objects

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
    "attendeeId": "uuid",
    "answersProcessed": "number"
  }
}
```

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
- `attendeeId` must belong to the authenticated user
- All required questions must have answers
- Question must belong to the selected goals category

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
      "field": "eventId",
      "message": "Event not found or inactive"
    }
  ]
}
```

### 401 Unauthorized  
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Goals category not found"
}
```

### 409 Conflict
```json
{
  "error": "User already registered for this event"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Answer validation failed",
  "details": [
    {
      "questionId": "uuid",
      "message": "Required question not answered"
    }
  ]
}
```

---

## Implementation Notes

### Security Considerations
- For attendee registration: Support both authenticated and anonymous users
- For visitors: Generate secure temporary tokens with limited scope
- Verify attendee ownership before processing answers
- Validate all foreign key relationships
- Use database transactions for multi-answer submissions
- Temporary tokens should have expiration and be tied to specific attendee/event

### Performance Considerations  
- Consider caching goals categories (relatively static data)
- Batch answer submissions to reduce database calls
- Index on frequently queried fields (attendee_id, question_id)

### Future Enhancements
- Add progress tracking to attendee model
- Support partial answer submissions (draft mode)
- Add question branching/conditional logic
- Include question help text or descriptions
