# Attendee API Contract

## Overview

This document outlines the API contract for attendee management, which includes registration, onboarding, and recommendation functionality.

## Flow

1. **Get Professions** - Fetch available professions by category
2. **Create Attendee** - Register for event (authenticated or visitor)
3. **Get Goals Categories** - Fetch available goal categories
4. **Select Goal Category** - Choose a category and receive associated questions
5. **Submit Answers** - Provide responses to the questionnaire
6. **Get Recommendations** - Fetch AI-generated networking recommendations

---

## Endpoints

### 1. Get Professions

**Endpoint:** `GET /api/attendee/professions`

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

**Endpoint:** `POST /api/attendee/register`

**Description:** Registers a new attendee for an event. Supports both authenticated users and visitors. For visitors, generates a temporary access token.

**Headers:**
- `Authorization: Bearer <token>` (optional - for authenticated users)

**Request Body:**
```json
{
  "eventId": "uuid",
  "nickname": "string",
  "userEmail": "string|null", 
  "professionId": "uuid",
  "linkedinUsername": "string|null",
  "photoLink": "string"
}
```

**Request Fields:**
- `eventId` - Event identifier (required)
- `nickname` - Attendee's display name (required) - can be real name or preferred name
- `userEmail` - Attendee's email address (optional)
- `professionId` - Selected profession from professions table (required)
- `linkedinUsername` - LinkedIn profile username
- `photoLink` - URL to profile photo (required)

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

**Endpoint:** `GET /api/attendee/goals-categories`

**Endpoint:** `GET /api/attendee/onboarding/goals-categories`

**Description:** Returns all active goals categories available for selection.

**Headers:**
- No authentication required
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

**Endpoint:** `GET /api/attendee/goals-categories/{categoryId}/questions`

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

**Question Object:**
- `id` - Question identifier
- `question` - Question text
- `type` - Question type enum (see [Question Types](#question-types))
- `placeholder` - Placeholder text for input fields
- `displayOrder` - Order for display
- `isRequired` - Whether question must be answered
- `isShareable` - Whether answer should be displayed in recommendations
- `constraints` - Type-specific constraints
- `answerOptions` - Available options (for selection-based questions)

**Constraints Object (conditional based on question type):**
- `minSelect` - Minimum selections required
- `maxSelect` - Maximum selections allowed
- `requireRanking` - Whether ranking is required
- `isUsingOther` - Whether "Other" option is available
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

**Endpoint:** `POST /api/attendee/answers`

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

### 6. Get Recommendations

**Endpoint:** `GET /api/attendee/recommendations/{attendeeId}`

**Description:** Retrieves AI-generated networking recommendations for a specific attendee. This endpoint triggers the AI recommendation service to generate fresh recommendations based on all attendees in the same event.

**Headers:**
- `Authorization: Bearer <token>` (required for authenticated users)
- For visitors: Use the temporary token received during registration

**Path Parameters:**
- `attendeeId` - UUID of the attendee requesting recommendations

**Response:**
```json
{
  "data": {
    "attendeeId": "uuid",
    "eventId": "uuid", 
    "recommendations": [
      {
        "targetAttendeeId": "uuid",
        "score": "decimal",
        "reasoning": "string",
        "targetAttendee": {
          "nickname": "string|null",
          "profession": {
            "name": "string",
            "categoryName": "string"
          },
          "goalsCategory": {
            "name": "string"
          },
          "linkedinUsername": "string|null",
          "photoLink": "string|null",
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
- `attendeeId` - Requesting attendee's ID
- `eventId` - Event identifier
- `recommendations` - Array of recommendation objects

**Recommendation Object:**
- `targetAttendeeId` - Recommended attendee's ID
- `score` - Compatibility score (0-1, up to 4 decimal places)
- `reasoning` - AI-generated explanation for the match
- `targetAttendee` - Complete attendee profile

**Target Attendee Object:**
- `nickname` - Preferred name
- `profession` - Profession name and category
- `goalsCategory` - Selected goals category
- `linkedinUsername` - LinkedIn profile handle
- `photoLink` - Profile photo URL
- `shareableAnswers` - Only answers where `isShareable` is true

**Shareable Answer Object:**
- `question` - Question text
- `questionType` - Type of question
- `answerLabel` - Selected option text (for choice-based questions)
- `textValue` - Free text response
- `numberValue` - Numeric response
- `dateValue` - Date response
- `rank` - Ranking value (for ranked questions)

**Business Logic:**
1. Validate attendee exists and belongs to requesting user/token
2. Call AI service endpoint `/ai/attendees/recommendations` with attendee data
3. Process AI response and enrich with attendee profile data
4. Filter answers to only include those where `question.isShareable` is true
5. Store recommendations in database
6. Return formatted response with complete attendee profiles

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

### 403 Forbidden
```json
{
  "error": "Attendee does not belong to authenticated user"
}
```

### 404 Not Found
```json
{
  "error": "Attendee not found"
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
