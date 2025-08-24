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

  body('start')
    .notEmpty()
    .withMessage('Event start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date')
    .custom(start => {
      const startDate = new Date(start);
      const now = new Date();
      if (startDate <= now) {
        throw new Error('Event start time must be in the future');
      }
      return true;
    }),

  body('end')
    .notEmpty()
    .withMessage('Event end time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date')
    .custom((end, { req }) => {
      const endDate = new Date(end);
      const startDate = new Date(req.body.start);
      if (endDate <= startDate) {
        throw new Error('Event end time must be after start time');
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

  body('photoLink')
    .optional()
    .isURL()
    .withMessage('Photo link must be a valid URL'),

  body('locationName')
    .optional()
    .isString()
    .withMessage('Location name must be a string')
    .isLength({ max: 200 })
    .withMessage('Location name must not exceed 200 characters')
    .trim(),

  body('locationAddress')
    .optional()
    .isString()
    .withMessage('Location address must be a string')
    .isLength({ max: 500 })
    .withMessage('Location address must not exceed 500 characters')
    .trim(),

  body('locationLink')
    .optional()
    .isURL()
    .withMessage('Location link must be a valid URL'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a number between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a number between -180 and 180'),

  body('link').optional().isURL().withMessage('Event link must be a valid URL'),
];

export const updateEventValidation = [
  param('code')
    .notEmpty()
    .withMessage('Event code is required')
    .isString()
    .withMessage('Event code must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('Event code must be exactly 6 characters'),

  body('name')
    .optional()
    .isString()
    .withMessage('Event name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Event name must be between 3 and 100 characters')
    .trim(),

  body('start')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date')
    .custom(start => {
      if (start) {
        const startDate = new Date(start);
        const now = new Date();
        if (startDate <= now) {
          throw new Error('Event start time must be in the future');
        }
      }
      return true;
    }),

  body('end')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date')
    .custom((end, { req }) => {
      if (end && req.body.start) {
        const endDate = new Date(end);
        const startDate = new Date(req.body.start);
        if (endDate <= startDate) {
          throw new Error('Event end time must be after start time');
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

  body('photoLink')
    .optional()
    .isURL()
    .withMessage('Photo link must be a valid URL'),

  body('locationName')
    .optional()
    .isString()
    .withMessage('Location name must be a string')
    .isLength({ max: 200 })
    .withMessage('Location name must not exceed 200 characters')
    .trim(),

  body('locationAddress')
    .optional()
    .isString()
    .withMessage('Location address must be a string')
    .isLength({ max: 500 })
    .withMessage('Location address must not exceed 500 characters')
    .trim(),

  body('locationLink')
    .optional()
    .isURL()
    .withMessage('Location link must be a valid URL'),

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
  param('code')
    .notEmpty()
    .withMessage('Event code is required')
    .isString()
    .withMessage('Event code must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('Event code must be exactly 6 characters'),
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

  query('filter')
    .optional()
    .isIn(['created', 'all'])
    .withMessage('Filter must be either created or all'),
];
