import { Router } from 'express';
import * as attendeeController from '../controllers/attendee.controller.js';
import {
  getProfessionsValidation,
  createAttendeeValidation,
  getGoalsCategoriesValidation,
  updateGoalsCategoryValidation,
  submitAnswersValidation,
  getRecommendationsValidation,
  validateEventValidation,
} from '../validations/attendee.validation.js';
import { validate } from '../utils/validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route GET /api/attendee/professions
 * @desc Get all professions grouped by category
 * @access Public
 */
router.get(
  '/professions',
  getProfessionsValidation,
  validate,
  attendeeController.getProfessions
);

/**
 * @route POST /api/attendee/register
 * @desc Register a new attendee for an event
 * @access Public (but checks for authentication)
 */
router.post(
  '/register',
  authenticate(['USER', 'EMPTY']), // Allow both user tokens and no token
  createAttendeeValidation,
  validate,
  attendeeController.createAttendee
);

/**
 * @route GET /api/attendee/goals-categories
 * @desc Get all active goals categories
 * @access Private (requires authentication)
 */
router.get(
  '/goals-categories',
  authenticate(['ATTENDEE']),
  getGoalsCategoriesValidation,
  validate,
  attendeeController.getGoalsCategories
);

/**
 * @route PUT /api/attendee/:attendeeId/goals-category
 * @desc Update attendee's goals category and get questions
 * @access Private (attendee owner only)
 */
router.put(
  '/:attendeeId/goals-category',
  authenticate(['ATTENDEE']),
  updateGoalsCategoryValidation,
  validate,
  attendeeController.updateGoalsCategory
);

/**
 * @route GET /api/attendee/recommendations/:attendeeId
 * @desc Get recommendations for attendee
 * @access Attendee only
 */
router.get(
  '/recommendations/:attendeeId',
  authenticate(['ATTENDEE']) // Only attendee tokens allowed
  // controller
);

/**
 * @route POST /api/attendee/answers
 * @desc Submit attendee answers and get AI recommendations
 * @access Private (attendee owner only)
 */
router.post(
  '/answers',
  authenticate(['ATTENDEE']),
  submitAnswersValidation,
  validate,
  attendeeController.submitAnswers
);

/**
 * @route GET /api/attendee/validate-event/:code
 * @desc Validate event by code for registration
 * @access Public
 */
router.get(
  '/validate-event/:code',
  validateEventValidation,
  validate,
  attendeeController.validateEvent
);

/**
 * @route GET /api/attendee/recommendations/:attendeeId
 * @desc Get AI recommendations for attendee
 * @access Private (attendee owner only)
 */
router.get(
  '/recommendations/:attendeeId',
  authenticate(['ATTENDEE']),
  getRecommendationsValidation,
  validate,
  attendeeController.getRecommendations
);

export default router;
