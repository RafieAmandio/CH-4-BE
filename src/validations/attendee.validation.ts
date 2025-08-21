import { body } from 'express-validator';

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
