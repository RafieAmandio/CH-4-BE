import { body, param, query } from 'express-validator';

export const createEventValidation = [
  body('name')
    .notEmpty()
    .withMessage('Event name is required')
    .isString()
    .withMessage('Event name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Event name must be between 3 and 100 characters')
    .trim(),

  body('datetime')
    .notEmpty()
    .withMessage('Event datetime is required')
    .isISO8601()
    .withMessage('Datetime must be a valid ISO 8601 date')
    .custom(datetime => {
      const eventDate = new Date(datetime);
      const now = new Date();
      if (eventDate <= now) {
        throw new Error('Event datetime must be in the future');
      }
      return true;
    }),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),

  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters')
    .trim(),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180'),
];

export const updateEventValidation = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required')
    .isString()
    .withMessage('Event ID must be a valid UUID'),

  body('name')
    .optional()
    .isString()
    .withMessage('Event name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Event name must be between 3 and 100 characters')
    .trim(),

  body('datetime')
    .optional()
    .isISO8601()
    .withMessage('Datetime must be a valid ISO 8601 date')
    .custom(datetime => {
      if (datetime) {
        const eventDate = new Date(datetime);
        const now = new Date();
        if (eventDate <= now) {
          throw new Error('Event datetime must be in the future');
        }
      }
      return true;
    }),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),

  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters')
    .trim(),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180'),
];

export const getEventValidation = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required')
    .isString()
    .withMessage('Event ID must be a valid UUID'),
];

export const getEventsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),

  query('sortBy')
    .optional()
    .isIn(['name', 'start', 'status', 'created_at', 'updated_at'])
    .withMessage(
      'SortBy must be one of: name, start, status, created_at, updated_at'
    ),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either asc or desc'),
];
