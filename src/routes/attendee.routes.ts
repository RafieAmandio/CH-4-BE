import { Router } from 'express';
import * as attendeeController from '../controllers/attendee.controller.js';
import {
  getProfessionsValidation,
  createAttendeeValidation,
} from '../validations/attendee.validation.js';
import { validate } from '../utils/validation.js';

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
  createAttendeeValidation,
  validate,
  attendeeController.createAttendee
);

export default router;
