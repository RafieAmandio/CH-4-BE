import { Router } from 'express';
import * as eventController from '../controllers/event.controller.js';
import {
  createEventValidation,
  updateEventValidation,
  getEventValidation,
  getEventsValidation,
} from '../validations/event.validation.js';
import { validate } from '../utils/validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/events
 * @desc Create a new event
 * @access Private (authenticated users only)
 */
router.post(
  '/',
  authenticate(['USER']),
  createEventValidation,
  validate,
  eventController.createEvent
);

/**
 * @route GET /api/events
 * @desc Get all events with pagination and filtering
 * @access Private (authenticated users only)
 */
router.get(
  '/',
  authenticate(['USER']),
  getEventsValidation,
  validate,
  eventController.getEvents
);

/**
 * @route GET /api/events/:code
 * @desc Get a single event by code
 * @access Private (authenticated users only)
 */
router.get(
  '/:code',
  authenticate(['USER']),
  getEventValidation,
  validate,
  eventController.getEventByCode
);

/**
 * @route PUT /api/events/:code
 * @desc Update an event by code
 * @access Private (event creator only)
 */
router.put(
  '/:code',
  authenticate(['USER']),
  updateEventValidation,
  validate,
  eventController.updateEvent
);

/**
 * @route DELETE /api/events/:code
 * @desc Delete/Disable an event by code
 * @access Private (event creator only)
 * @query hard_delete=true for permanent deletion, otherwise soft delete (disable)
 */
router.delete(
  '/:code',
  authenticate(['USER']),
  getEventValidation,
  validate,
  eventController.deleteEvent
);

export default router;
