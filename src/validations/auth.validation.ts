import { body } from 'express-validator';

export const registerValidation = [
  body('auth_provider')
    .optional()
    .isIn(['APPLE', 'LINKEDIN', 'EMAIL'])
    .withMessage('Auth provider must be APPLE, LINKEDIN, or EMAIL')
    .default('EMAIL'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username must be a string')
    .trim(),

  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .trim(),

  // body('nickname')
  //   .notEmpty()
  //   .withMessage('Nickname is required')
  //   .isString()
  //   .withMessage('Nickname must be a string')
  //   .trim(),

  // body('photo')
  //   .notEmpty()
  //   .withMessage('Photo is required')
  //   .isString()
  //   .withMessage('Photo must be a string')
  //   .trim(),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
    .default(true),
];

export const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

export const callbackValidation = [
  // No body validation needed - all data comes from Supabase token in Authorization header
  // The middleware will validate the token and extract user data
];
