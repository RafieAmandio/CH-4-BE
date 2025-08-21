import { body, param } from 'express-validator';

export const updateProfileValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),

  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('linkedinUsername')
    .optional()
    .isString()
    .withMessage('LinkedIn username must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('LinkedIn username must be between 1 and 50 characters'),

  body('photoLink')
    .optional()
    .isURL()
    .withMessage('Photo link must be a valid URL'),

  body('professionId')
    .optional()
    .isUUID()
    .withMessage('Profession ID must be a valid UUID'),
];

export const uploadPhotoValidation = [
  body('photoUrl')
    .notEmpty()
    .withMessage('Photo URL is required')
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
];

export const completeRegistrationValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('email')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),

  body('linkedinUsername')
    .optional()
    .isString()
    .withMessage('LinkedIn username must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('LinkedIn username must be between 1 and 50 characters'),

  body('photoLink')
    .notEmpty()
    .withMessage('Photo link is required')
    .isURL()
    .withMessage('Photo link must be a valid URL'),

  body('professionId')
    .notEmpty()
    .withMessage('Profession ID is required')
    .isUUID()
    .withMessage('Profession ID must be a valid UUID'),
];

export const getUserProfileValidation = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];
