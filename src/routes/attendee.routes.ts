import { Router } from 'express';
import * as attendeeController from '../controllers/attendee.controller.js';
import {
  getProfessionsValidation,
  createAttendeeValidation,
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
 * @route PUT /api/attendee/:attendeeId/goals-category
 * @desc Update attendee's goals category
 * @access Attendee only (user with attendee context or visitor attendee)
 */
router.put(
  '/:attendeeId/goals-category',
  authenticate(['USER', 'ATTENDEE']) // Allow user tokens and attendee tokens
  // validation,
  // controller
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

export default router;
