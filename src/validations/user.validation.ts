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
    .optional({ nullable: true })
    .custom(value => {
      // Handle various "null" cases that frontend might send
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'null'
      ) {
        return true; // Allow null/undefined/empty/"null" values
      }
      if (typeof value !== 'string') {
        throw new Error('LinkedIn username must be a string');
      }
      if (value.trim().length === 0) {
        throw new Error('LinkedIn username cannot be empty');
      }
      if (value.trim().length > 50) {
        throw new Error(
          'LinkedIn username must be between 1 and 50 characters'
        );
      }
      return true;
    })
    .withMessage(
      'LinkedIn username must be a valid string between 1 and 50 characters'
    ),

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
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),

  body('linkedinUsername')
    .optional({ nullable: true })
    .custom(value => {
      // Handle various "null" cases that frontend might send
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'null'
      ) {
        return true; // Allow null/undefined/empty/"null" values
      }
      if (typeof value !== 'string') {
        throw new Error('LinkedIn username must be a string');
      }
      if (value.trim().length === 0) {
        throw new Error('LinkedIn username cannot be empty');
      }
      if (value.trim().length > 50) {
        throw new Error(
          'LinkedIn username must be between 1 and 50 characters'
        );
      }
      return true;
    })
    .withMessage(
      'LinkedIn username must be a valid string between 1 and 50 characters'
    ),

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
