import { body, param } from 'express-validator';

// Get professions - no validation needed (public endpoint, no params)
export const getProfessionsValidation = [
  // No validation required for this endpoint
];

export const createAttendeeValidation = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isUUID()
    .withMessage('Event ID must be a valid UUID'),

  body('nickname')
    .notEmpty()
    .withMessage('Nickname is required')
    .isString()
    .withMessage('Nickname must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nickname must be between 1 and 100 characters'),

  body('userEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('professionId')
    .notEmpty()
    .withMessage('Profession ID is required')
    .isUUID()
    .withMessage('Profession ID must be a valid UUID'),

  body('linkedinUsername')
    .optional()
    .isString()
    .withMessage('LinkedIn username must be a string')
    .trim()
    .isLength({ max: 50 })
    .withMessage('LinkedIn username must not exceed 50 characters'),

  body('photoLink')
    .notEmpty()
    .withMessage('Photo link is required')
    .isURL()
    .withMessage('Photo link must be a valid URL'),
];

// Get goals categories - no validation needed
export const getGoalsCategoriesValidation = [
  // No validation required for this endpoint
];

// Update attendee with goals category
export const updateGoalsCategoryValidation = [
  param('attendeeId')
    .notEmpty()
    .withMessage('Attendee ID is required')
    .isUUID()
    .withMessage('Attendee ID must be a valid UUID'),

  body('goalsCategoryId')
    .notEmpty()
    .withMessage('Goals category ID is required')
    .isUUID()
    .withMessage('Goals category ID must be a valid UUID'),
];

export const submitAnswersValidation = [
  body('attendeeId')
    .notEmpty()
    .withMessage('Attendee ID is required')
    .isUUID()
    .withMessage('Attendee ID must be a valid UUID'),

  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers array is required and must not be empty'),

  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required')
    .isUUID()
    .withMessage('Question ID must be a valid UUID'),

  body('answers.*.answerOptionId')
    .optional()
    .isUUID()
    .withMessage('Answer Option ID must be a valid UUID'),

  body('answers.*.textValue')
    .optional()
    .isString()
    .withMessage('Text value must be a string'),

  body('answers.*.numberValue')
    .optional()
    .isNumeric()
    .withMessage('Number value must be numeric'),

  body('answers.*.dateValue')
    .optional()
    .isISO8601()
    .withMessage('Date value must be a valid ISO 8601 date'),

  body('answers.*.rank')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Rank must be a positive integer'),

  body('answers.*.weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be numeric'),
];

export const getRecommendationsValidation = [
  param('attendeeId')
    .notEmpty()
    .withMessage('Attendee ID is required')
    .isUUID()
    .withMessage('Attendee ID must be a valid UUID'),
];

export const validateEventValidation = [
  param('code')
    .notEmpty()
    .withMessage('Event code is required')
    .isString()
    .withMessage('Event code must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('Event code must be exactly 6 characters')
    .matches(/^[0-9]{6}$/)
    .withMessage('Event code must be a 6-digit number'),
];
