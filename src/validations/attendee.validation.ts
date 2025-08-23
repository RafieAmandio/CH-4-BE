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

// Get goals categories - no validation needed (attendeeId from token)
export const getGoalsCategoriesValidation = [
  // No validation required - attendeeId comes from token
];

// Update attendee with goals category (attendeeId from token)
export const updateGoalsCategoryValidation = [
  // Remove param validation since attendeeId comes from token
  body('goalsCategoryId')
    .notEmpty()
    .withMessage('Goals category ID is required')
    .isUUID()
    .withMessage('Goals category ID must be a valid UUID'),
];

export const submitAnswersValidation = [
  // No attendeeId validation needed - comes from token
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
    .withMessage('Text value must be a string')
    .isLength({ max: 1000 })
    .withMessage('Text value must not exceed 1000 characters'),

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
  // No validation required - attendeeId comes from token
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