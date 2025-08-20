# Attendee Onboarding API Contract

## Overview

This document outlines the API contract for the attendee onboarding process, which consists of three main endpoints to guide users through goal selection and questionnaire completion.

## Flow

1. **Get Goals Categories** - Fetch available goal categories
2. **Select Goal Category** - Choose a category and receive associated questions
3. **Submit Answers** - Provide responses to the questionnaire

---

## Endpoints

### 1. Get Goals Categories

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

### 2. Get Questions by Goals Category

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

### 3. Submit User Answers

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
- `questionId` - Question being answered
- `answerOptionId` - Selected option ID (for selection-based questions)
- `textValue` - Text response (for FREE_TEXT questions)
- `numberValue` - Numeric response (for NUMBER questions)
- `dateValue` - Date response (for DATE questions)
- `rank` - Ranking value (for RANKED_CHOICE questions)
- `weight` - Weighting value (for SCALE questions)

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
      "field": "questionId",
      "message": "Question does not belong to selected goals category"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Goals category not found"
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
- Verify attendee ownership before processing answers
- Validate all foreign key relationships
- Use database transactions for multi-answer submissions

### Performance Considerations  
- Consider caching goals categories (relatively static data)
- Batch answer submissions to reduce database calls
- Index on frequently queried fields (attendee_id, question_id)

### Future Enhancements
- Add progress tracking to attendee model
- Support partial answer submissions (draft mode)
- Add question branching/conditional logic
- Include question help text or descriptions
