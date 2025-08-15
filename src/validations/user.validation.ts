import { body, param } from 'express-validator';

export const updateProfileValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Username must be between 1 and 50 characters'),

  body('nickname')
    .optional()
    .isString()
    .withMessage('Nickname must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nickname must be between 1 and 50 characters'),
];

export const getUserProfileValidation = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

export const uploadPhotoValidation = [
  body('photoUrl')
    .notEmpty()
    .withMessage('Photo URL is required')
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
];
